import { NotificationOut } from "../types/Notification";

/** Resolve in-app path for a notification click. */
export function getNotificationHref(n: NotificationOut): string {
  const data = n.data ?? {};
  const bookingId =
    typeof data.bookingId === "string"
      ? data.bookingId
      : typeof data.booking_id === "string"
        ? data.booking_id
        : null;

  switch (n.type) {
    case "payment_paid":
    case "payment_refunded":
      return bookingId ? `/appointments/${bookingId}` : "/appointments";
    case "prescription_created":
      return "/prescriptions";
    case "call_started":
    case "call_ended":
      return bookingId ? `/video-call/${bookingId}` : "/appointments";
    case "comment_created":
    case "rating_created":
      return "/dashboard";
    case "booking_created":
    case "booking_confirmed":
    case "booking_updated":
    case "booking_finished":
    case "booking_cancelled":
      return bookingId ? `/appointments/${bookingId}` : "/appointments";
    default:
      return bookingId ? `/appointments/${bookingId}` : "/dashboard";
  }
}
