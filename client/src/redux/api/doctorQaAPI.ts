import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DoctorAnswerBody,
  DoctorQuestion,
  DoctorQuestionCreate,
  DoctorQuestionListParams,
  PaginatedList,
} from "../../types/DoctorBoard";
import { toQueryString } from "../../lib/queryParams";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const doctorQaAPI = createApi({
  reducerPath: "doctorQaAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/doctor-qa`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["DoctorQa"],
  endpoints: (builder) => ({
    listDoctorQuestions: builder.query<
      PaginatedList<DoctorQuestion>,
      { doctorUserId: string; params?: DoctorQuestionListParams }
    >({
      query: ({ doctorUserId, params = {} }) => {
        const qs = toQueryString({
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          status: params.status,
        });
        return { url: `/${doctorUserId}${qs}`, method: "GET" };
      },
      providesTags: (_r, _e, { doctorUserId }) => [
        { type: "DoctorQa", id: doctorUserId },
      ],
    }),
    createDoctorQuestion: builder.mutation<DoctorQuestion, DoctorQuestionCreate>({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: ["DoctorQa"],
    }),
    answerDoctorQuestion: builder.mutation<
      DoctorQuestion,
      { id: string; body: DoctorAnswerBody }
    >({
      query: ({ id, body }) => ({
        url: `/${id}/answer`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DoctorQa"],
    }),
    updateDoctorAnswer: builder.mutation<
      DoctorQuestion,
      { id: string; body: DoctorAnswerBody }
    >({
      query: ({ id, body }) => ({
        url: `/${id}/answer`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["DoctorQa"],
    }),
    deleteDoctorQuestion: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["DoctorQa"],
    }),
  }),
});

export const {
  useListDoctorQuestionsQuery,
  useCreateDoctorQuestionMutation,
  useAnswerDoctorQuestionMutation,
  useUpdateDoctorAnswerMutation,
  useDeleteDoctorQuestionMutation,
} = doctorQaAPI;
