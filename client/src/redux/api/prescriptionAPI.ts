import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Prescription,
  PrescriptionCreate,
  PrescriptionUpdate,
  PrescriptionPaginatedResponse,
  PatientPrescriptionListParams,
  DoctorPrescriptionListParams,
} from "../../types/Prescription";
import { toQueryString } from "../../lib/queryParams";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const prescriptionAPI = createApi({
  reducerPath: "prescriptionAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/prescription`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Prescription"],
  endpoints: (builder) => ({
    createPrescription: builder.mutation<Prescription, PrescriptionCreate>({
      query: (prescriptionData) => ({
        url: "/",
        method: "POST",
        body: prescriptionData,
      }),
      invalidatesTags: ["Prescription"],
    }),

    getPatientPrescriptions: builder.query<
      PrescriptionPaginatedResponse,
      PatientPrescriptionListParams | void
    >({
      query: (params = {}) => {
        const qs = toQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          doctor_id: params?.doctor_id,
        });
        return { url: `/patient${qs}`, method: "GET" };
      },
      providesTags: ["Prescription"],
    }),

    getDoctorPrescriptions: builder.query<
      PrescriptionPaginatedResponse,
      DoctorPrescriptionListParams | void
    >({
      query: (params = {}) => {
        const qs = toQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          patient_id: params?.patient_id,
        });
        return { url: `/doctor${qs}`, method: "GET" };
      },
      providesTags: ["Prescription"],
    }),

    getPrescriptionById: builder.query<Prescription, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Prescription", id }],
    }),

    updatePrescription: builder.mutation<
      Prescription,
      { id: string; data: PrescriptionUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Prescription", id }, "Prescription"],
    }),
  }),
});

export const {
  useCreatePrescriptionMutation,
  useGetPatientPrescriptionsQuery,
  useGetDoctorPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useUpdatePrescriptionMutation,
} = prescriptionAPI;
