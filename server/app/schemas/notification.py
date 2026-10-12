from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal, List
from datetime import datetime
from app.schemas.common import PaginatedResponse

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


class NotificationOut(BaseModel):
    id: str
    recipientId: str
    actorId: Optional[str] = None
    type: NotificationType
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    isRead: bool = False
    readAt: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class NotificationPaginatedResponse(PaginatedResponse[NotificationOut]):
    pass


class UnreadCountResponse(BaseModel):
    count: int


class MarkReadResponse(BaseModel):
    success: bool = True
    updated: int = 0
