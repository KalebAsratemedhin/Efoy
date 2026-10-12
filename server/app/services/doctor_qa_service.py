from typing import Optional
from datetime import datetime
from fastapi import HTTPException
from beanie import PydanticObjectId

from app.db.models.doctor_question import DoctorQuestion
from app.db.models.user import User
from app.db.models.doctor import Doctor
from app.db.models.content_reaction import ContentReaction
from app.schemas.doctor_qa import (
    DoctorQuestionCreate,
    DoctorAnswerCreate,
    DoctorAnswerUpdate,
    DoctorQuestionOut,
)
from app.services.reaction_service import get_my_reactions_map


def _link_id(link) -> str:
    if hasattr(link, "ref"):
        return str(link.ref.id)
    if hasattr(link, "id"):
        return str(link.id)
    return str(link)


async def _resolve_asker(question: DoctorQuestion) -> Optional[User]:
    link = question.askerId
    if isinstance(link, User) or hasattr(link, "fullName"):
        return link  # type: ignore[return-value]
    try:
        return await User.get(PydanticObjectId(_link_id(link)))
    except Exception:
        return None


async def _serialize_question(
    question: DoctorQuestion,
    my_reaction: Optional[str] = None,
    my_answer_reaction: Optional[str] = None,
) -> dict:
    asker = await _resolve_asker(question)
    return {
        "id": str(question.id),
        "doctorId": _link_id(question.doctorId),
        "askerId": _link_id(question.askerId),
        "askerName": getattr(asker, "fullName", None) if asker else None,
        "askerPic": getattr(asker, "profilePic", None) if asker else None,
        "body": question.body,
        "status": question.status,
        "answerBody": question.answerBody,
        "answeredAt": question.answeredAt,
        "likeCount": getattr(question, "likeCount", 0) or 0,
        "dislikeCount": getattr(question, "dislikeCount", 0) or 0,
        "myReaction": my_reaction,
        "answerLikeCount": getattr(question, "answerLikeCount", 0) or 0,
        "answerDislikeCount": getattr(question, "answerDislikeCount", 0) or 0,
        "myAnswerReaction": my_answer_reaction,
        "created_at": question.created_at,
        "updated_at": question.updated_at,
    }


async def _ensure_doctor_user(user_id: str) -> User:
    user = await User.get(PydanticObjectId(user_id))
    if not user or user.role != "doctor":
        raise HTTPException(status_code=404, detail="Doctor not found")
    profile = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(user_id))
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return user


class DoctorQAService:
    @staticmethod
    async def list_questions(
        doctor_user_id: str,
        page: int = 1,
        limit: int = 10,
        status: Optional[str] = None,
        current_user: Optional[User] = None,
    ) -> dict:
        await _ensure_doctor_user(doctor_user_id)
        is_owner = (
            current_user is not None
            and current_user.role == "doctor"
            and str(current_user.id) == doctor_user_id
        )

        find_args = [DoctorQuestion.doctorId.id == PydanticObjectId(doctor_user_id)]

        if status:
            if status not in ("open", "answered", "closed"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid status. Allowed: open, answered, closed",
                )
            if status == "closed" and not is_owner:
                raise HTTPException(
                    status_code=403,
                    detail="Only the profile doctor can view closed questions",
                )
            find_args.append(DoctorQuestion.status == status)
        elif not is_owner:
            # Public: hide closed
            find_args.append({"status": {"$ne": "closed"}})

        skip = (page - 1) * limit
        total = await DoctorQuestion.find(*find_args).count()
        questions = (
            await DoctorQuestion.find(*find_args)
            .sort([("created_at", -1)])
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        total_pages = (total + limit - 1) // limit if total else 0
        ids = [str(q.id) for q in questions]
        q_map = await get_my_reactions_map(current_user, "question", ids)
        a_map = await get_my_reactions_map(current_user, "answer", ids)
        items = [
            DoctorQuestionOut.model_validate(
                await _serialize_question(
                    q,
                    my_reaction=q_map.get(str(q.id)),
                    my_answer_reaction=a_map.get(str(q.id)),
                )
            )
            for q in questions
        ]
        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def create_question(data: DoctorQuestionCreate, current_user: User) -> dict:
        # Gate A: any authenticated patient may ask
        if current_user.role != "patient":
            raise HTTPException(status_code=403, detail="Only patients can ask questions")
        if str(current_user.id) == data.doctorId:
            raise HTTPException(status_code=400, detail="You cannot ask yourself a question")

        await _ensure_doctor_user(data.doctorId)

        question = DoctorQuestion(
            doctorId=PydanticObjectId(data.doctorId),
            askerId=current_user,
            body=data.body,
            status="open",
        )
        await question.insert()
        return DoctorQuestionOut.model_validate(await _serialize_question(question))

    @staticmethod
    async def _question_out(question: DoctorQuestion, current_user: Optional[User]) -> dict:
        qid = str(question.id)
        q_map = await get_my_reactions_map(current_user, "question", [qid])
        a_map = await get_my_reactions_map(current_user, "answer", [qid])
        return DoctorQuestionOut.model_validate(
            await _serialize_question(
                question,
                my_reaction=q_map.get(qid),
                my_answer_reaction=a_map.get(qid),
            )
        )

    @staticmethod
    async def answer_question(
        question_id: str,
        data: DoctorAnswerCreate,
        current_user: User,
    ) -> dict:
        question = await DoctorQuestion.get(PydanticObjectId(question_id))
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        if current_user.role != "doctor" or str(current_user.id) != _link_id(question.doctorId):
            raise HTTPException(status_code=403, detail="Only the profile doctor can answer")
        if question.status == "closed":
            raise HTTPException(status_code=400, detail="Cannot answer a closed question")

        question.answerBody = data.body
        question.status = "answered"
        question.answeredAt = datetime.utcnow()
        await question.save()
        return await DoctorQAService._question_out(question, current_user)

    @staticmethod
    async def update_answer(
        question_id: str,
        data: DoctorAnswerUpdate,
        current_user: User,
    ) -> dict:
        question = await DoctorQuestion.get(PydanticObjectId(question_id))
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        if current_user.role != "doctor" or str(current_user.id) != _link_id(question.doctorId):
            raise HTTPException(status_code=403, detail="Only the profile doctor can edit answers")
        if not question.answerBody:
            raise HTTPException(status_code=400, detail="Question has no answer to edit")

        question.answerBody = data.body
        question.status = "answered"
        question.answeredAt = question.answeredAt or datetime.utcnow()
        await question.save()
        return await DoctorQAService._question_out(question, current_user)

    @staticmethod
    async def delete_question(question_id: str, current_user: User) -> None:
        question = await DoctorQuestion.get(PydanticObjectId(question_id))
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        doctor_id = _link_id(question.doctorId)
        asker_id = _link_id(question.askerId)
        is_owner_doctor = current_user.role == "doctor" and str(current_user.id) == doctor_id
        is_asker = str(current_user.id) == asker_id

        async def _delete():
            qid = str(question.id)
            await ContentReaction.find(
                {"targetType": {"$in": ["question", "answer"]}, "targetId": qid}
            ).delete()
            await question.delete()

        if is_owner_doctor:
            await _delete()
            return

        if is_asker:
            if question.status != "open" or question.answerBody:
                raise HTTPException(
                    status_code=403,
                    detail="You can only delete your unanswered open questions",
                )
            await _delete()
            return

        raise HTTPException(status_code=403, detail="Not allowed to delete this question")
