export type NotificationType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_updated"
  | "booking_finished"
  | "booking_cancelled"
  | "payment_paid"
  | "payment_refunded"
  | "comment_created"
  | "rating_created"
  | "prescription_created"
  | "call_started"
  | "call_ended";

export interface NotificationOut {
  id: string;
  recipientId: string;
  actorId?: string | null;
  type: NotificationType | string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationPaginatedResponse {
  items: NotificationOut[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export type NotificationWsMessage =
  | { type: "connected"; userId: string }
  | { type: "notification"; notification: NotificationOut }
  | { type: "notification_read"; notificationId: string }
  | { type: "notifications_read_all"; updated: number }
  | { type: "pong" };
