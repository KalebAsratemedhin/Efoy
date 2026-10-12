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


def _serialize_comment(comment: Comment) -> dict:
    return {
        "id": str(comment.id),
        "commenterId": _link_id(comment.commenterId),
        "doctorId": _link_id(comment.doctorId),
        "content": comment.content,
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
        return _serialize_comment(comment)

    @staticmethod
    async def delete_comment(id: str, current_user: User):
        comment = await Comment.get(PydanticObjectId(id))
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        if _link_id(comment.commenterId) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You can only delete your own comments")

        payload = _serialize_comment(comment)
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
        return _serialize_comment(comment)

    @staticmethod
    async def get_comments(doctorId: str):
        if not doctorId:
            raise HTTPException(status_code=400, detail="No Id provided.")
        comments = await Comment.find(
            Comment.doctorId.id == PydanticObjectId(doctorId),
            fetch_links=False
        ).to_list()
        return [_serialize_comment(c) for c in comments]

    @staticmethod
    async def get_doctor_comments(doctorId: str):
        comments = await Comment.find(
            Comment.doctorId.id == PydanticObjectId(doctorId)
        ).to_list()
        return [_serialize_comment(c) for c in comments]
