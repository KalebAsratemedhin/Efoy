from pydantic import BaseModel, Field
from typing import Literal, Optional

ReactionTargetType = Literal["post", "question", "answer"]
ReactionValue = Literal["like", "dislike"]


class ReactionCreate(BaseModel):
    targetType: ReactionTargetType
    targetId: str = Field(..., min_length=1)
    value: ReactionValue


class ReactionOut(BaseModel):
    targetType: ReactionTargetType
    targetId: str
    value: Optional[ReactionValue] = None
    likeCount: int = 0
    dislikeCount: int = 0
    myReaction: Optional[ReactionValue] = None
