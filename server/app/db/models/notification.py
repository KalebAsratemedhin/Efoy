from app.db.models.base import BaseDocument
from beanie import Link
from pydantic import Field
from typing import Optional, Dict, Any, Literal
from datetime import datetime
from app.db.models.user import User

NotificationType = Literal[
    "booking_created",
    "booking_confirmed",
    "booking_updated",
    "booking_finished",
    "booking_cancelled",
    "payment_paid",
    "payment_refunded",
    "comment_created",
    "rating_created",
    "prescription_created",
    "call_started",
    "call_ended",
]


class Notification(BaseDocument):
    recipientId: Link[User]
    actorId: Optional[Link[User]] = None
    type: NotificationType
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    isRead: bool = False
    readAt: Optional[datetime] = None

    class Settings:
        name = "notifications"
        indexes = [
            "recipientId",
            "isRead",
            "type",
            "created_at",
            [("recipientId", 1), ("isRead", 1), ("created_at", -1)],
            [("recipientId", 1), ("created_at", -1)],
        ]
