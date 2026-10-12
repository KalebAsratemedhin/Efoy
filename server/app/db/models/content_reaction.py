from app.db.models.base import BaseDocument
from beanie import Link
from pydantic import Field
from typing import Literal
from app.db.models.user import User

ReactionTargetType = Literal["post", "question", "answer"]
ReactionValue = Literal["like", "dislike"]


class ContentReaction(BaseDocument):
    userId: Link[User]
    targetType: ReactionTargetType
    targetId: str = Field(..., min_length=1)
    value: ReactionValue

    class Settings:
        name = "content_reactions"
        indexes = [
            "userId",
            "targetType",
            "targetId",
            "value",
            [("targetType", 1), ("targetId", 1)],
            [("userId", 1), ("targetType", 1), ("targetId", 1)],
        ]
