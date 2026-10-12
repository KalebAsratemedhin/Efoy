import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Doctor,
  DoctorCreate,
  DoctorDataUpdate,
  DoctorListParams,
  PaginatedResponse,
} from "../../types/User";
import { toQueryString } from "../../lib/queryParams";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const doctorAPI = createApi({
  reducerPath: "doctorAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/doctor`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Doctor", "User", "Specialities"],
  endpoints: (builder) => ({
    getDoctors: builder.query<PaginatedResponse<Doctor>, DoctorListParams | void>({
      query: (params = {}) => {
        const qs = toQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
          speciality: params?.speciality,
          min_rating: params?.min_rating,
          min_experience: params?.min_experience,
          max_experience: params?.max_experience,
          min_price: params?.min_price,
          max_price: params?.max_price,
          sort: params?.sort,
          include_restricted: params?.include_restricted ? true : undefined,
        });
        return { url: qs || "/", method: "GET" };
      },
      providesTags: ["Doctor"],
    }),
    getSpecialities: builder.query<string[], { includeRestricted?: boolean } | void>({
      query: (params) => {
        const qs = toQueryString({
          include_restricted: params?.includeRestricted ? true : undefined,
        });
        return {
          url: `/specialities${qs}`,
          method: "GET",
        };
      },
      providesTags: ["Specialities"],
    }),
    getDoctorById: builder.query<
      Doctor,
      { id: string; includeRestricted?: boolean } | string
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const includeRestricted = typeof arg === "string" ? false : Boolean(arg.includeRestricted);
        const qs = toQueryString({
          include_restricted: includeRestricted ? true : undefined,
        });
        return {
          url: `/${id}${qs}`,
          method: "GET",
        };
      },
      providesTags: (_, __, arg) => [
        { type: "Doctor", id: typeof arg === "string" ? arg : arg.id },
      ],
    }),
    getDoctorByUserId: builder.query<Doctor, string>({
      query: (userId: string) => ({
        url: `/user/${userId}`,
        method: "GET",
      }),
      providesTags: (_, __, userId) => [{ type: "Doctor", userId }],
    }),
    updateDoctor: builder.mutation<Doctor, { id: string; update: DoctorDataUpdate }>({
      query: ({ id, update }) => ({
        url: `/${id}`,
        method: "PUT",
        body: update,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Doctor", id }, "Doctor"],
    }),
    updateWorkingHours: builder.mutation<
      Doctor,
      { id: string; workingHours: Record<string, { start: string; end: string }> }
    >({
      query: ({ id, workingHours }) => ({
        url: `/${id}/working-hours`,
        method: "PUT",
        body: workingHours,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Doctor", id }, "Doctor"],
    }),
    adminCreateDoctor: builder.mutation<Doctor, DoctorCreate>({
      query: (doctorData) => ({
        url: "/admin-create",
        method: "POST",
        body: doctorData,
      }),
      invalidatesTags: ["Doctor", "User", "Specialities"],
    }),
    availableTimeSlots: builder.query<string[], { doctorId: string; date: string }>({
      query: ({ doctorId, date }) => ({
        url: `/available-slots?doctor=${doctorId}&date=${date}`,
        method: "GET",
      }),
      providesTags: (_, __, { doctorId }) => [{ type: "Doctor", id: doctorId }],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetSpecialitiesQuery,
  useGetDoctorByIdQuery,
  useGetDoctorByUserIdQuery,
  useUpdateDoctorMutation,
  useUpdateWorkingHoursMutation,
  useAdminCreateDoctorMutation,
  useAvailableTimeSlotsQuery,
} = doctorAPI;
