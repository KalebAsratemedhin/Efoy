from app.db.models.base import BaseDocument
from beanie import Link
from pydantic import Field
from typing import Optional, Literal
from app.db.models.user import User

PostCategory = Literal["education", "awareness", "tips", "general"]
PostStatus = Literal["draft", "published"]


class DoctorPost(BaseDocument):
    doctorId: Link[User]
    title: str = Field(..., min_length=3, max_length=120)
    body: str = Field(..., min_length=1, max_length=5000)
    category: Optional[PostCategory] = None
    status: PostStatus = "published"
    likeCount: int = Field(default=0, ge=0)
    dislikeCount: int = Field(default=0, ge=0)

    class Settings:
        name = "doctor_posts"
        indexes = [
            "doctorId",
            "status",
            "category",
            "created_at",
            [("doctorId", 1), ("status", 1), ("created_at", -1)],
            [("doctorId", 1), ("created_at", -1)],
        ]
