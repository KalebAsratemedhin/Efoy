import logging
from datetime import datetime
from typing import Any, Dict, Optional, Union

from beanie import PydanticObjectId
from fastapi import HTTPException

from app.core.notification_manager import notification_manager
from app.db.models.notification import Notification, NotificationType
from app.db.models.user import User
from app.schemas.notification import NotificationOut

logger = logging.getLogger(__name__)


def _link_id(link) -> str:
    if hasattr(link, "ref"):
        return str(link.ref.id)
    if hasattr(link, "id"):
        return str(link.id)
    return str(link)


def serialize_notification(notification: Notification) -> dict:
    return {
        "id": str(notification.id),
        "recipientId": _link_id(notification.recipientId),
        "actorId": _link_id(notification.actorId) if notification.actorId else None,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "data": notification.data or {},
        "isRead": notification.isRead,
        "readAt": notification.readAt,
        "created_at": notification.created_at,
        "updated_at": notification.updated_at,
    }


class NotificationService:
    @staticmethod
    async def notify(
        recipient_id: Union[str, PydanticObjectId],
        type: NotificationType,
        title: str,
        message: str,
        *,
        actor_id: Optional[Union[str, PydanticObjectId]] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> Optional[NotificationOut]:
        """Persist a notification and push live if the recipient is connected.

        Never raises to callers — domain actions must not fail because of notify.
        """
        try:
            recipient_oid = PydanticObjectId(str(recipient_id))
            if actor_id is not None and str(actor_id) == str(recipient_id):
                return None

            notification = Notification(
                recipientId=recipient_oid,
                actorId=PydanticObjectId(str(actor_id)) if actor_id else None,
                type=type,
                title=title,
                message=message,
                data=data or {},
            )
            await notification.insert()
            payload = serialize_notification(notification)

            try:
                await notification_manager.send_to_user(
                    str(recipient_oid),
                    {"type": "notification", "notification": payload},
                )
            except Exception as push_err:
                logger.warning("Live notification push failed: %s", push_err)

            return NotificationOut.model_validate(payload)
        except Exception as e:
            logger.error("Failed to create notification: %s", e, exc_info=True)
            return None

    @staticmethod
    async def list_notifications(
        current_user: User,
        page: int = 1,
        limit: int = 20,
        unread_only: bool = False,
    ) -> dict:
        skip = (page - 1) * limit
        find_args = [Notification.recipientId.id == current_user.id]
        if unread_only:
            find_args.append(Notification.isRead == False)  # noqa: E712

        total = await Notification.find(*find_args).count()
        items = (
            await Notification.find(*find_args)
            .sort([("created_at", -1)])
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        total_pages = (total + limit - 1) // limit if total else 0
        return {
            "items": [NotificationOut.model_validate(serialize_notification(n)) for n in items],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def unread_count(current_user: User) -> dict:
        count = await Notification.find(
            Notification.recipientId.id == current_user.id,
            Notification.isRead == False,  # noqa: E712
        ).count()
        return {"count": count}

    @staticmethod
    async def mark_read(notification_id: str, current_user: User) -> dict:
        notification = await Notification.get(PydanticObjectId(notification_id))
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        if _link_id(notification.recipientId) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not your notification")

        if not notification.isRead:
            notification.isRead = True
            notification.readAt = datetime.utcnow()
            await notification.save()

            await notification_manager.send_to_user(
                str(current_user.id),
                {
                    "type": "notification_read",
                    "notificationId": str(notification.id),
                },
            )

        return {"success": True, "updated": 1}

    @staticmethod
    async def mark_all_read(current_user: User) -> dict:
        unread = await Notification.find(
            Notification.recipientId.id == current_user.id,
            Notification.isRead == False,  # noqa: E712
        ).to_list()
        now = datetime.utcnow()
        for notification in unread:
            notification.isRead = True
            notification.readAt = now
            await notification.save()

        if unread:
            await notification_manager.send_to_user(
                str(current_user.id),
                {"type": "notifications_read_all", "updated": len(unread)},
            )

        return {"success": True, "updated": len(unread)}
