from fastapi import WebSocket
from typing import Dict, Set, Any
import json
import logging

logger = logging.getLogger(__name__)


class NotificationConnectionManager:
    """Authenticated per-user WebSocket fan-out for in-app notifications.

    In-memory only — fine for a single API process. For multiple replicas,
    add Redis pub/sub and broadcast across workers.
    """

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(
            "Notification WS connected user=%s connections=%s",
            user_id,
            len(self.active_connections[user_id]),
        )

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        sockets = self.active_connections.get(user_id)
        if not sockets:
            return
        sockets.discard(websocket)
        if not sockets:
            del self.active_connections[user_id]
            logger.info("Notification WS removed empty room user=%s", user_id)
        else:
            logger.info(
                "Notification WS disconnected user=%s remaining=%s",
                user_id,
                len(sockets),
            )

    async def send_to_user(self, user_id: str, payload: Dict[str, Any]) -> int:
        sockets = self.active_connections.get(user_id)
        if not sockets:
            return 0

        message = json.dumps(payload, default=str)
        dead: Set[WebSocket] = set()
        sent = 0

        for websocket in list(sockets):
            try:
                await websocket.send_text(message)
                sent += 1
            except Exception as e:
                logger.warning("Notification WS send failed user=%s: %s", user_id, e)
                dead.add(websocket)

        for websocket in dead:
            self.disconnect(websocket, user_id)

        return sent

    def connection_count(self, user_id: str) -> int:
        return len(self.active_connections.get(user_id, set()))


notification_manager = NotificationConnectionManager()
