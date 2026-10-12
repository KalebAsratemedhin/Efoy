import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  NotificationOut,
  NotificationPaginatedResponse,
  UnreadCountResponse,
} from "../../types/Notification";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const notificationAPI = createApi({
  reducerPath: "notificationAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/notification`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationPaginatedResponse,
      { page?: number; limit?: number; unread_only?: boolean } | void
    >({
      query: (params = {}) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        const unread_only = params?.unread_only ?? false;
        return {
          url: `/?page=${page}&limit=${limit}&unread_only=${unread_only}`,
          method: "GET",
        };
      },
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/unread-count",
        method: "GET",
      }),
      providesTags: ["UnreadCount"],
    }),
    markNotificationRead: builder.mutation<NotificationOut, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
    markAllNotificationsRead: builder.mutation<{ updated: number }, void>({
      query: () => ({
        url: "/read-all",
        method: "POST",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationAPI;
