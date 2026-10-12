import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.notification_manager import notification_manager
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.notification import (
    MarkReadResponse,
    NotificationPaginatedResponse,
    UnreadCountResponse,
)
from app.services.notification_service import NotificationService
from beanie import PydanticObjectId

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


async def _user_from_ws_token(token: Optional[str]) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            return None
        return await User.get(PydanticObjectId(user_id))
    except (JWTError, Exception) as e:
        logger.warning("Notification WS auth failed: %s", e)
        return None


@router.websocket("/ws")
async def notification_ws(websocket: WebSocket, token: Optional[str] = Query(None)):
    """Authenticated live notification channel.

    Connect: ws://host/api/v1/notification/ws?token=<JWT>
    Server → client messages:
      { "type": "notification", "notification": NotificationOut }
      { "type": "notification_read", "notificationId": "..." }
      { "type": "notifications_read_all", "updated": N }
      { "type": "connected", "userId": "..." }
    Client may send {"type":"ping"} → {"type":"pong"}
    """
    user = await _user_from_ws_token(token)
    if not user:
        await websocket.close(code=4401, reason="Unauthorized")
        return

    user_id = str(user.id)
    await notification_manager.connect(websocket, user_id)

    try:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "userId": user_id,
        }))
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                continue
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error("Notification WS error user=%s: %s", user_id, e)
        notification_manager.disconnect(websocket, user_id)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass


@router.get("/", response_model=NotificationPaginatedResponse)
async def list_notifications(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
):
    return await NotificationService.list_notifications(
        current_user, page=page, limit=limit, unread_only=unread_only
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(current_user: User = Depends(get_current_user)):
    return await NotificationService.unread_count(current_user)


@router.patch("/{notification_id}/read", response_model=MarkReadResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    return await NotificationService.mark_read(notification_id, current_user)


@router.post("/read-all", response_model=MarkReadResponse, status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    return await NotificationService.mark_all_read(current_user)
