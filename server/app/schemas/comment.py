from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.common import PaginatedResponse

class CommentCreate(BaseModel):
    doctorId: str
    content: str = Field(..., min_length=1)

    @field_validator('content')
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Content cannot be empty')
        return v

class CommentUpdate(BaseModel):
    content: Optional[str]

    @field_validator('content')
    @classmethod
    def not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Content cannot be empty')
        return v

class CommentOut(BaseModel):
    id: str
    commenterId: str
    doctorId: str
    content: str
    commenterName: Optional[str] = None
    commenterPic: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    model_config = {"from_attributes": True}


class CommentPaginatedResponse(PaginatedResponse[CommentOut]):
    pass
