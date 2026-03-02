import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface VideoCallData {
  call_id: string;
  token: string;
  api_key: string;
  user_id: string;
  user_name: string;
  booking: {
    id: string;
    appointmentDate: string;
    time: string;
    reason: string;
    status: string;
  };
}

interface CallStatusData {
  booking_id: string;
  appointment_type: string;
  call_id: string;
  call_started: string;
  call_ended: string;
  call_duration_minutes: number;
  status: string;
  can_join: boolean;
}

export const videoAPI = createApi({
  reducerPath: 'videoAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/video`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['VideoCall'],
  endpoints: (builder) => ({
    generateVideoToken: builder.mutation<VideoCallData, void>({
      query: () => ({
        url: '/generate-token',
        method: 'Post',
      }),
      invalidatesTags: ['VideoCall']
    }),

    joinVideoCall: builder.mutation<VideoCallData, string>({
      query: (bookingId) => ({
        url: `/join-call/${bookingId}`,
        method: 'Post',
      }),
      invalidatesTags: ['VideoCall']
    }),

    endVideoCall: builder.mutation<{ message: string; call_duration_minutes: number; booking_status: string }, string>({
      query: (bookingId) => ({
        url: `/end-call/${bookingId}`,
        method: 'Post',
      }),
      invalidatesTags: ['VideoCall']
    }),

    getCallStatus: builder.query<CallStatusData, string>({
      query: (bookingId) => ({
        url: `/call-status/${bookingId}`,
        method: 'Get',
      }),
      providesTags: (_, __, bookingId) => [
        { type: 'VideoCall', id: bookingId }
      ]
    }),
  })
});

export const {
  useGenerateVideoTokenMutation,
  useJoinVideoCallMutation,
  useEndVideoCallMutation,
  useGetCallStatusQuery
} = videoAPI; 