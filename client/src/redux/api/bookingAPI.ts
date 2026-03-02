import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Booking, BookingPopulated, BookingPaginatedResponse } from "../../types/Booking";
const backendUrl = import.meta.env.VITE_BACKEND_URL;


export const bookingAPI = createApi({
    reducerPath: 'bookingAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/booking`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ['MyBookings', 'Booking', 'Doctor'],
    endpoints: (builder) => ({
        createBooking: builder.mutation<BookingPopulated, Booking >({
            query: (credential) => ({
                url: '/',
                method: 'Post',
                body: credential,
                
            }),
            invalidatesTags: ['MyBookings', 'Doctor']
        }),
        updateBooking: builder.mutation<BookingPopulated, {id: string, update: Partial<Booking>} >({
            query: ({id, update}) => ({
                url: `/${id}`,
                method: 'Put',
                body: update,
                
            }),
            invalidatesTags: ['MyBookings', 'Booking', 'Doctor']

        }),
        deleteBooking: builder.mutation<void, string >({
            query: (id) => ({
                url: `/${id}`,
                method: 'Delete'
                
            }),
            invalidatesTags: ['MyBookings', 'Doctor']
        }),
        markBookingFinished: builder.mutation<BookingPopulated, string>({
            query: (id) => ({
                url: `/${id}/finish`,
                method: 'Put'
            }),
            invalidatesTags: ['MyBookings', 'Booking', 'Doctor']
        }),

        findRecentBooking: builder.query<BookingPopulated, void>({
            query: () => ({
                url: `/recent`,
                method: 'Get'
            }),
            providesTags: ['MyBookings']
        }),

        findOneBooking: builder.query<BookingPopulated, string>({
            query: (id) => ({
                url: `/${id}`,
                method: 'Get'
            }),
            providesTags: (_, __, id) => [
                { type: 'Booking', id }
            ]
        }),

        findCurrentUserBookings: builder.query<BookingPaginatedResponse, {page: number, limit: number}>({
            query: ({ page = 1, limit = 10 }) => ({
                url: `?page=${page}&limit=${limit}`,
                method: 'Get'
            }),
            providesTags: ['MyBookings']
        }),
        findPatientSummary: builder.query<number[], string>({
            query: (patientId) => ({
                url: `/patient/${patientId}`,
                method: 'Get'
            }),
            providesTags: (_, __, patientId) => [
                { type: 'MyBookings', id: patientId }
            ]
        }),
        findDoctorSummary: builder.query<number[], string>({
            query: (doctorId) => ({
                url: `/doctor/${doctorId}`,
                method: 'Get'
            }),
            providesTags: (_, __, doctorId) => [
                { type: 'Doctor', id: doctorId }
            ]
        }),

    })
})

export const {
    useCreateBookingMutation, 
    useUpdateBookingMutation,
    useDeleteBookingMutation,
    useMarkBookingFinishedMutation,
    useFindCurrentUserBookingsQuery,
    useFindOneBookingQuery,
    useFindRecentBookingQuery,
    useFindPatientSummaryQuery,
    useFindDoctorSummaryQuery

} = bookingAPI
