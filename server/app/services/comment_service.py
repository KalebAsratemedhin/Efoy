from typing import Optional
from app.db.models.comment import Comment
from app.db.models.user import User
from app.schemas.comment import CommentCreate, CommentUpdate
from beanie import PydanticObjectId
from fastapi import HTTPException


def _link_id(link) -> str:
    """Extract a string id from a Beanie Link (fetched doc or DBRef)."""
    if hasattr(link, "ref"):
        return str(link.ref.id)
    if hasattr(link, "id"):
        return str(link.id)
    return str(link)


async def _resolve_commenter(comment: Comment) -> Optional[User]:
    link = comment.commenterId
    if isinstance(link, User) or hasattr(link, "fullName"):
        return link  # type: ignore[return-value]
    try:
        return await User.get(PydanticObjectId(_link_id(link)))
    except Exception:
        return None


async def _serialize_comment(comment: Comment) -> dict:
    commenter = await _resolve_commenter(comment)
    return {
        "id": str(comment.id),
        "commenterId": _link_id(comment.commenterId),
        "doctorId": _link_id(comment.doctorId),
        "content": comment.content,
        "commenterName": getattr(commenter, "fullName", None) if commenter else None,
        "commenterPic": getattr(commenter, "profilePic", None) if commenter else None,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
    }


class CommentService:
    @staticmethod
    async def create_comment(data: CommentCreate, current_user: User):
        if str(current_user.id) == data.doctorId:
            raise HTTPException(status_code=400, detail="You cannot comment on yourself.")
        comment = Comment(
            commenterId=current_user,
            doctorId=PydanticObjectId(data.doctorId),
            content=data.content
        )
        await comment.insert()
        from app.services.notification_service import NotificationService
        preview = data.content.strip()
        if len(preview) > 80:
            preview = preview[:77] + "..."
        await NotificationService.notify(
            recipient_id=data.doctorId,
            type="comment_created",
            title="New review comment",
            message=f"{current_user.fullName} left a comment: {preview}",
            actor_id=current_user.id,
            data={
                "commentId": str(comment.id),
                "doctorId": data.doctorId,
            },
        )
        return await _serialize_comment(comment)

    @staticmethod
    async def delete_comment(id: str, current_user: User):
        comment = await Comment.get(PydanticObjectId(id))
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        if _link_id(comment.commenterId) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You can only delete your own comments")

        payload = await _serialize_comment(comment)
        await comment.delete()
        return payload

    @staticmethod
    async def update_comment(id: str, data: CommentUpdate, current_user: User):
        comment = await Comment.get(PydanticObjectId(id))
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        if _link_id(comment.commenterId) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You can only update your own comments")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(comment, field, value)

        await comment.save()
        return await _serialize_comment(comment)

    @staticmethod
    async def get_comments(doctorId: str, page: int = 1, limit: int = 10):
        if not doctorId:
            raise HTTPException(status_code=400, detail="No Id provided.")
        try:
            doctor_oid = PydanticObjectId(doctorId)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid doctorId")

        find_filter = Comment.doctorId.id == doctor_oid
        skip = (page - 1) * limit
        total = await Comment.find(find_filter).count()
        comments = (
            await Comment.find(find_filter, fetch_links=True)
            .sort([("created_at", -1)])
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        total_pages = (total + limit - 1) // limit if total else 0
        return {
            "items": [await _serialize_comment(c) for c in comments],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def get_doctor_comments(doctorId: str, page: int = 1, limit: int = 10):
        return await CommentService.get_comments(doctorId, page=page, limit=limit)
