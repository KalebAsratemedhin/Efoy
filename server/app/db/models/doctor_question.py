from app.db.models.base import BaseDocument
from beanie import Link
from pydantic import Field
from typing import Optional, Literal
from datetime import datetime
from app.db.models.user import User

QuestionStatus = Literal["open", "answered", "closed"]


class DoctorQuestion(BaseDocument):
    doctorId: Link[User]
    askerId: Link[User]
    body: str = Field(..., min_length=5, max_length=2000)
    status: QuestionStatus = "open"
    answerBody: Optional[str] = Field(default=None, max_length=5000)
    answeredAt: Optional[datetime] = None
    likeCount: int = Field(default=0, ge=0)
    dislikeCount: int = Field(default=0, ge=0)
    answerLikeCount: int = Field(default=0, ge=0)
    answerDislikeCount: int = Field(default=0, ge=0)

    class Settings:
        name = "doctor_questions"
        indexes = [
            "doctorId",
            "askerId",
            "status",
            "created_at",
            [("doctorId", 1), ("status", 1), ("created_at", -1)],
            [("doctorId", 1), ("created_at", -1)],
            [("askerId", 1), ("created_at", -1)],
        ]
