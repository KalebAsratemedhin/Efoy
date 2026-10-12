import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useNotificationSocket } from "../../hooks/useNotificationSocket";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} from "../../redux/api/notificationAPI";
import { authSelector } from "../../redux/slices/authSlice";

/** Connects WS + seeds unread badge / inbox cache while authenticated. */
const NotificationProvider = ({ children }: { children?: ReactNode }) => {
  const auth = useSelector(authSelector);
  const skip = !auth.id || !localStorage.getItem("accessToken");

  useNotificationSocket();
  useGetUnreadCountQuery(undefined, { skip });
  useGetNotificationsQuery({ page: 1, limit: 20, unread_only: false }, { skip });

  return <>{children}</>;
};

export default NotificationProvider;
