import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const dashboardAPI = createApi({
  reducerPath: "dashboardAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/dashboard`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Dashboard", "User", "Doctor", "Booking"],
  endpoints: (builder) => ({
    getDoctorDashboard: builder.query<any, void>({
      query: () => ({
        url: '/doctor',
        method: 'GET',
      }),
      providesTags: ["Dashboard", "Doctor"],
    }),
    getPatientDashboard: builder.query<any, void>({
      query: () => ({
        url: '/patient',
        method: 'GET',
      }),
      providesTags: ["Dashboard", "User"],
    }),
  }),
});

export const { 
  useGetDoctorDashboardQuery,
  useGetPatientDashboardQuery
} = dashboardAPI; 