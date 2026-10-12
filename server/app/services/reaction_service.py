from typing import Dict, List, Optional, Tuple
from fastapi import HTTPException
from beanie import PydanticObjectId
from beanie.operators import And

from app.db.models.content_reaction import ContentReaction
from app.db.models.doctor_post import DoctorPost
from app.db.models.doctor_question import DoctorQuestion
from app.db.models.user import User
from app.schemas.reaction import ReactionCreate, ReactionOut


def _parse_object_id(value: str, field_name: str = "targetId") -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}")


def _link_id(link) -> str:
    if hasattr(link, "ref"):
        return str(link.ref.id)
    if hasattr(link, "id"):
        return str(link.id)
    return str(link)


async def get_my_reactions_map(
    current_user: Optional[User],
    target_type: str,
    target_ids: List[str],
) -> Dict[str, str]:
    """Return {targetId: value} for the current user's reactions on these targets."""
    if not current_user or not target_ids:
        return {}
    reactions = await ContentReaction.find(
        And(
            ContentReaction.userId.id == current_user.id,
            ContentReaction.targetType == target_type,
            {"targetId": {"$in": target_ids}},
        )
    ).to_list()
    return {r.targetId: r.value for r in reactions}


class ReactionService:
    @staticmethod
    async def _load_target(target_type: str, target_id: str, current_user: Optional[User]):
        oid = _parse_object_id(target_id)
        if target_type == "post":
            post = await DoctorPost.get(oid)
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            is_owner = (
                current_user is not None
                and current_user.role == "doctor"
                and str(current_user.id) == _link_id(post.doctorId)
            )
            if post.status == "draft" and not is_owner:
                raise HTTPException(status_code=404, detail="Post not found")
            return post

        if target_type in ("question", "answer"):
            question = await DoctorQuestion.get(oid)
            if not question:
                raise HTTPException(status_code=404, detail="Question not found")
            if target_type == "answer" and not question.answerBody:
                raise HTTPException(status_code=400, detail="Question has no answer to react to")
            return question

        raise HTTPException(status_code=400, detail="Invalid targetType")

    @staticmethod
    def _counts_from_target(target_type: str, target) -> Tuple[int, int]:
        if target_type == "post":
            return target.likeCount, target.dislikeCount
        if target_type == "question":
            return target.likeCount, target.dislikeCount
        # answer
        return target.answerLikeCount, target.answerDislikeCount

    @staticmethod
    async def _apply_count_delta(
        target_type: str,
        target,
        *,
        old_value: Optional[str],
        new_value: Optional[str],
    ) -> None:
        """Update denormalized counters for a reaction change."""
        if old_value == new_value:
            return

        like_field = "likeCount" if target_type != "answer" else "answerLikeCount"
        dislike_field = "dislikeCount" if target_type != "answer" else "answerDislikeCount"

        if old_value == "like":
            setattr(target, like_field, max(0, getattr(target, like_field) - 1))
        elif old_value == "dislike":
            setattr(target, dislike_field, max(0, getattr(target, dislike_field) - 1))

        if new_value == "like":
            setattr(target, like_field, getattr(target, like_field) + 1)
        elif new_value == "dislike":
            setattr(target, dislike_field, getattr(target, dislike_field) + 1)

        await target.save()

    @staticmethod
    async def set_reaction(data: ReactionCreate, current_user: User) -> ReactionOut:
        target = await ReactionService._load_target(
            data.targetType, data.targetId, current_user
        )

        existing = await ContentReaction.find_one(
            And(
                ContentReaction.userId.id == current_user.id,
                ContentReaction.targetType == data.targetType,
                ContentReaction.targetId == data.targetId,
            )
        )

        old_value = existing.value if existing else None
        if old_value == data.value:
            like_count, dislike_count = ReactionService._counts_from_target(
                data.targetType, target
            )
            return ReactionOut(
                targetType=data.targetType,
                targetId=data.targetId,
                value=data.value,
                likeCount=like_count,
                dislikeCount=dislike_count,
                myReaction=data.value,
            )

        if existing:
            existing.value = data.value
            await existing.save()
        else:
            reaction = ContentReaction(
                userId=current_user,
                targetType=data.targetType,
                targetId=data.targetId,
                value=data.value,
            )
            await reaction.insert()

        await ReactionService._apply_count_delta(
            data.targetType, target, old_value=old_value, new_value=data.value
        )
        # reload counts after save
        target = await ReactionService._load_target(
            data.targetType, data.targetId, current_user
        )
        like_count, dislike_count = ReactionService._counts_from_target(
            data.targetType, target
        )
        return ReactionOut(
            targetType=data.targetType,
            targetId=data.targetId,
            value=data.value,
            likeCount=like_count,
            dislikeCount=dislike_count,
            myReaction=data.value,
        )

    @staticmethod
    async def remove_reaction(
        target_type: str,
        target_id: str,
        current_user: User,
    ) -> ReactionOut:
        if target_type not in ("post", "question", "answer"):
            raise HTTPException(status_code=400, detail="Invalid targetType")

        target = await ReactionService._load_target(target_type, target_id, current_user)
        existing = await ContentReaction.find_one(
            And(
                ContentReaction.userId.id == current_user.id,
                ContentReaction.targetType == target_type,
                ContentReaction.targetId == target_id,
            )
        )
        if existing:
            old_value = existing.value
            await existing.delete()
            await ReactionService._apply_count_delta(
                target_type, target, old_value=old_value, new_value=None
            )
            target = await ReactionService._load_target(
                target_type, target_id, current_user
            )

        like_count, dislike_count = ReactionService._counts_from_target(
            target_type, target
        )
        return ReactionOut(
            targetType=target_type,  # type: ignore[arg-type]
            targetId=target_id,
            value=None,
            likeCount=like_count,
            dislikeCount=dislike_count,
            myReaction=None,
        )
