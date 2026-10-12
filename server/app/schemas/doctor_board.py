from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from app.schemas.common import PaginatedResponse

PostCategory = Literal["education", "awareness", "tips", "general"]
PostStatus = Literal["draft", "published"]


class DoctorPostCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    body: str = Field(..., min_length=1, max_length=5000)
    category: Optional[PostCategory] = None
    status: PostStatus = "published"

    @field_validator("title", "body")
    @classmethod
    def strip_not_empty(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value


class DoctorPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=120)
    body: Optional[str] = Field(None, min_length=1, max_length=5000)
    category: Optional[PostCategory] = None
    status: Optional[PostStatus] = None

    @field_validator("title", "body")
    @classmethod
    def strip_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        value = v.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value


class DoctorPostOut(BaseModel):
    id: str
    doctorId: str
    title: str
    body: str
    category: Optional[PostCategory] = None
    status: PostStatus
    likeCount: int = 0
    dislikeCount: int = 0
    myReaction: Optional[Literal["like", "dislike"]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class DoctorPostPaginatedResponse(PaginatedResponse[DoctorPostOut]):
    pass
