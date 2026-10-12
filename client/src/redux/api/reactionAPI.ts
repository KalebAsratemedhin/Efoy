import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReactionOut, ReactionUpsert } from "../../types/DoctorBoard";
import { toQueryString } from "../../lib/queryParams";
import { doctorBoardAPI } from "./doctorBoardAPI";
import { doctorQaAPI } from "./doctorQaAPI";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const reactionAPI = createApi({
  reducerPath: "reactionAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/reactions`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    upsertReaction: builder.mutation<ReactionOut, ReactionUpsert>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(doctorBoardAPI.util.invalidateTags(["DoctorBoard"]));
          dispatch(doctorQaAPI.util.invalidateTags(["DoctorQa"]));
        } catch {
          /* surfaced by caller */
        }
      },
    }),
    removeReaction: builder.mutation<
      ReactionOut,
      { targetType: ReactionUpsert["targetType"]; targetId: string }
    >({
      query: ({ targetType, targetId }) => ({
        url: toQueryString({ targetType, targetId }) || "/",
        method: "DELETE",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(doctorBoardAPI.util.invalidateTags(["DoctorBoard"]));
          dispatch(doctorQaAPI.util.invalidateTags(["DoctorQa"]));
        } catch {
          /* surfaced by caller */
        }
      },
    }),
  }),
});

export const { useUpsertReactionMutation, useRemoveReactionMutation } = reactionAPI;
