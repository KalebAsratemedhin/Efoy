from typing import Optional
from fastapi import HTTPException
from beanie import PydanticObjectId

from app.db.models.doctor_post import DoctorPost
from app.db.models.user import User
from app.db.models.doctor import Doctor
from app.schemas.doctor_board import DoctorPostCreate, DoctorPostUpdate, DoctorPostOut
from app.services.reaction_service import get_my_reactions_map
from app.core.account_status import assert_doctor_publicly_visible


def _link_id(link) -> str:
    if hasattr(link, "ref"):
        return str(link.ref.id)
    if hasattr(link, "id"):
        return str(link.id)
    return str(link)


def _serialize_post(post: DoctorPost, my_reaction: Optional[str] = None) -> dict:
    return {
        "id": str(post.id),
        "doctorId": _link_id(post.doctorId),
        "title": post.title,
        "body": post.body,
        "category": post.category,
        "status": post.status,
        "likeCount": getattr(post, "likeCount", 0) or 0,
        "dislikeCount": getattr(post, "dislikeCount", 0) or 0,
        "myReaction": my_reaction,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


async def _ensure_doctor_user(
    user_id: str,
    *,
    current_user: Optional[User] = None,
) -> User:
    allow_restricted = bool(current_user and current_user.role == "admin")
    user = await assert_doctor_publicly_visible(
        user_id, allow_restricted=allow_restricted
    )
    profile = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(user_id))
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return user


class DoctorBoardService:
    @staticmethod
    async def list_posts(
        doctor_user_id: str,
        page: int = 1,
        limit: int = 10,
        category: Optional[str] = None,
        status: Optional[str] = None,
        current_user: Optional[User] = None,
    ) -> dict:
        await _ensure_doctor_user(doctor_user_id, current_user=current_user)
        is_owner = (
            current_user is not None
            and current_user.role == "doctor"
            and str(current_user.id) == doctor_user_id
        )

        find_args = [DoctorPost.doctorId.id == PydanticObjectId(doctor_user_id)]

        if is_owner:
            if status:
                if status not in ("draft", "published"):
                    raise HTTPException(status_code=400, detail="Invalid status. Allowed: draft, published")
                find_args.append(DoctorPost.status == status)
        else:
            # Non-owners never see drafts
            find_args.append(DoctorPost.status == "published")
            if status and status != "published":
                raise HTTPException(
                    status_code=403,
                    detail="Only the profile doctor can view draft posts",
                )

        if category:
            if category not in ("education", "awareness", "tips", "general"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid category. Allowed: education, awareness, tips, general",
                )
            find_args.append(DoctorPost.category == category)

        skip = (page - 1) * limit
        total = await DoctorPost.find(*find_args).count()
        posts = (
            await DoctorPost.find(*find_args)
            .sort([("created_at", -1)])
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        total_pages = (total + limit - 1) // limit if total else 0
        my_map = await get_my_reactions_map(
            current_user, "post", [str(p.id) for p in posts]
        )
        return {
            "items": [
                DoctorPostOut.model_validate(
                    _serialize_post(p, my_map.get(str(p.id)))
                )
                for p in posts
            ],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def get_post(post_id: str, current_user: Optional[User] = None) -> dict:
        post = await DoctorPost.get(PydanticObjectId(post_id))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        doctor_id = _link_id(post.doctorId)
        await _ensure_doctor_user(doctor_id, current_user=current_user)
        is_owner = (
            current_user is not None
            and current_user.role == "doctor"
            and str(current_user.id) == doctor_id
        )
        if post.status == "draft" and not is_owner:
            raise HTTPException(status_code=404, detail="Post not found")

        my_map = await get_my_reactions_map(current_user, "post", [str(post.id)])
        return DoctorPostOut.model_validate(
            _serialize_post(post, my_map.get(str(post.id)))
        )

    @staticmethod
    async def create_post(data: DoctorPostCreate, current_user: User) -> dict:
        if current_user.role != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can create board posts")
        await _ensure_doctor_user(str(current_user.id), current_user=current_user)

        post = DoctorPost(
            doctorId=current_user,
            title=data.title,
            body=data.body,
            category=data.category,
            status=data.status,
        )
        await post.insert()
        return DoctorPostOut.model_validate(_serialize_post(post))

    @staticmethod
    async def update_post(post_id: str, data: DoctorPostUpdate, current_user: User) -> dict:
        post = await DoctorPost.get(PydanticObjectId(post_id))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if current_user.role != "doctor" or str(current_user.id) != _link_id(post.doctorId):
            raise HTTPException(status_code=403, detail="You can only update your own posts")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(post, field, value)
        await post.save()
        my_map = await get_my_reactions_map(current_user, "post", [str(post.id)])
        return DoctorPostOut.model_validate(
            _serialize_post(post, my_map.get(str(post.id)))
        )

    @staticmethod
    async def delete_post(post_id: str, current_user: User) -> None:
        post = await DoctorPost.get(PydanticObjectId(post_id))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if current_user.role != "doctor" or str(current_user.id) != _link_id(post.doctorId):
            raise HTTPException(status_code=403, detail="You can only delete your own posts")
        # Clean up reactions for this post
        from app.db.models.content_reaction import ContentReaction
        await ContentReaction.find(
            ContentReaction.targetType == "post",
            ContentReaction.targetId == str(post.id),
        ).delete()
        await post.delete()
