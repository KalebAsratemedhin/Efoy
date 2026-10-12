import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DoctorPost,
  DoctorPostCreate,
  DoctorPostListParams,
  DoctorPostUpdate,
  PaginatedList,
} from "../../types/DoctorBoard";
import { toQueryString } from "../../lib/queryParams";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const doctorBoardAPI = createApi({
  reducerPath: "doctorBoardAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/doctor-board`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["DoctorBoard"],
  endpoints: (builder) => ({
    listDoctorPosts: builder.query<
      PaginatedList<DoctorPost>,
      { doctorUserId: string; params?: DoctorPostListParams }
    >({
      query: ({ doctorUserId, params = {} }) => {
        const qs = toQueryString({
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          category: params.category,
          status: params.status,
        });
        return { url: `/${doctorUserId}${qs}`, method: "GET" };
      },
      providesTags: (_r, _e, { doctorUserId }) => [
        { type: "DoctorBoard", id: doctorUserId },
      ],
    }),
    getDoctorPost: builder.query<DoctorPost, string>({
      query: (id) => ({ url: `/post/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "DoctorBoard", id }],
    }),
    createDoctorPost: builder.mutation<DoctorPost, DoctorPostCreate>({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: ["DoctorBoard"],
    }),
    updateDoctorPost: builder.mutation<
      DoctorPost,
      { id: string; update: DoctorPostUpdate }
    >({
      query: ({ id, update }) => ({ url: `/${id}`, method: "PUT", body: update }),
      invalidatesTags: ["DoctorBoard"],
    }),
    deleteDoctorPost: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["DoctorBoard"],
    }),
  }),
});

export const {
  useListDoctorPostsQuery,
  useGetDoctorPostQuery,
  useCreateDoctorPostMutation,
  useUpdateDoctorPostMutation,
  useDeleteDoctorPostMutation,
} = doctorBoardAPI;
