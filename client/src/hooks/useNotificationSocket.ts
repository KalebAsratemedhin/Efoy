import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { authSelector } from "../redux/slices/authSlice";
import { notificationAPI } from "../redux/api/notificationAPI";
import { AppDispatch } from "../redux/store";
import { NotificationOut, NotificationWsMessage } from "../types/Notification";

const PING_MS = 25_000;
const MAX_BACKOFF_MS = 30_000;

function buildWsUrl(token: string): string {
  const base = (import.meta.env.VITE_BACKEND_URL as string).replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/notification/ws?token=${encodeURIComponent(token)}`;
}

/**
 * Keeps the notification WebSocket alive while authenticated.
 * On events: toast, bump unread cache, prepend inbox cache.
 */
export function useNotificationSocket() {
  const auth = useSelector(authSelector);
  const dispatch = useDispatch<AppDispatch>();
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(1000);
  const intentionalClose = useRef(false);

  useEffect(() => {
    const token = auth.accessToken || localStorage.getItem("accessToken");
    if (!auth.id || !token) {
      intentionalClose.current = true;
      cleanup();
      return;
    }

    intentionalClose.current = false;
    connect(token);

    return () => {
      intentionalClose.current = true;
      cleanup();
    };

    function cleanup() {
      if (pingRef.current) clearInterval(pingRef.current);
      pingRef.current = null;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    }

    function connect(accessToken: string) {
      cleanup();
      intentionalClose.current = false;

      let ws: WebSocket;
      try {
        ws = new WebSocket(buildWsUrl(accessToken));
      } catch {
        scheduleReconnect(accessToken);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        backoffRef.current = 1000;
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_MS);
      };

      ws.onmessage = (event) => {
        let msg: NotificationWsMessage;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        handleMessage(msg);
      };

      ws.onclose = () => {
        if (pingRef.current) clearInterval(pingRef.current);
        pingRef.current = null;
        wsRef.current = null;
        if (!intentionalClose.current) scheduleReconnect(accessToken);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    function scheduleReconnect(accessToken: string) {
      if (intentionalClose.current) return;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      const delay = backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
      reconnectRef.current = setTimeout(() => {
        if (!intentionalClose.current) connect(accessToken);
      }, delay);
    }

    function handleMessage(msg: NotificationWsMessage) {
      if (msg.type === "pong" || msg.type === "connected") return;

      if (msg.type === "notification") {
        const n = msg.notification;
        toast(n.title, { description: n.message, id: `notif-${n.id}` });
        prependNotification(n);
        bumpUnread(+1);
        return;
      }

      if (msg.type === "notification_read") {
        markLocalRead(msg.notificationId);
        return;
      }

      if (msg.type === "notifications_read_all") {
        markAllLocalRead();
      }
    }

    function prependNotification(n: NotificationOut) {
      dispatch(
        notificationAPI.util.updateQueryData(
          "getNotifications",
          { page: 1, limit: 20, unread_only: false },
          (draft) => {
            draft.items = [n, ...draft.items.filter((x) => x.id !== n.id)];
            draft.total += 1;
          }
        )
      );
    }

    function bumpUnread(delta: number) {
      dispatch(
        notificationAPI.util.updateQueryData("getUnreadCount", undefined, (draft) => {
          draft.count = Math.max(0, (draft.count ?? 0) + delta);
        })
      );
    }

    function markLocalRead(id: string) {
      let wasUnread = false;
      dispatch(
        notificationAPI.util.updateQueryData(
          "getNotifications",
          { page: 1, limit: 20, unread_only: false },
          (draft) => {
            const item = draft.items.find((x) => x.id === id);
            if (item && !item.isRead) {
              item.isRead = true;
              item.readAt = new Date().toISOString();
              wasUnread = true;
            }
          }
        )
      );
      if (wasUnread) bumpUnread(-1);
    }

    function markAllLocalRead() {
      dispatch(
        notificationAPI.util.updateQueryData(
          "getNotifications",
          { page: 1, limit: 20, unread_only: false },
          (draft) => {
            for (const item of draft.items) {
              if (!item.isRead) {
                item.isRead = true;
                item.readAt = new Date().toISOString();
              }
            }
          }
        )
      );
      dispatch(
        notificationAPI.util.updateQueryData("getUnreadCount", undefined, (draft) => {
          draft.count = 0;
        })
      );
    }
  }, [auth.id, auth.accessToken, dispatch]);
}
