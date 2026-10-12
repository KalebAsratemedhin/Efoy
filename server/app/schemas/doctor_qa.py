from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from app.schemas.common import PaginatedResponse

QuestionStatus = Literal["open", "answered", "closed"]


class DoctorQuestionCreate(BaseModel):
    doctorId: str
    body: str = Field(..., min_length=5, max_length=2000)

    @field_validator("body")
    @classmethod
    def strip_not_empty(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("Question cannot be empty")
        return value


class DoctorAnswerCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)

    @field_validator("body")
    @classmethod
    def strip_not_empty(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("Answer cannot be empty")
        return value


class DoctorAnswerUpdate(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)

    @field_validator("body")
    @classmethod
    def strip_not_empty(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("Answer cannot be empty")
        return value


class DoctorQuestionOut(BaseModel):
    id: str
    doctorId: str
    askerId: str
    askerName: Optional[str] = None
    askerPic: Optional[str] = None
    body: str
    status: QuestionStatus
    answerBody: Optional[str] = None
    answeredAt: Optional[datetime] = None
    likeCount: int = 0
    dislikeCount: int = 0
    myReaction: Optional[Literal["like", "dislike"]] = None
    answerLikeCount: int = 0
    answerDislikeCount: int = 0
    myAnswerReaction: Optional[Literal["like", "dislike"]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class DoctorQuestionPaginatedResponse(PaginatedResponse[DoctorQuestionOut]):
    pass
