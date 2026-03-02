import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PaymentIntent, PaymentSession, AppointmentPayment, PaymentSuccess } from "../../types/Payment";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const paymentAPI = createApi({
    reducerPath: 'paymentAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/payment`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ['Payment'],
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation<PaymentIntent, AppointmentPayment>({
            query: (paymentData) => ({
                url: '/create-payment-intent',
                method: 'POST',
                body: paymentData,
            }),
            invalidatesTags: ['Payment']
        }),

        createCheckoutSession: builder.mutation<PaymentSession, AppointmentPayment>({
            query: (paymentData) => ({
                url: '/create-checkout-session',
                method: 'POST',
                body: paymentData,
            }),
            invalidatesTags: ['Payment']
        }),

        confirmPayment: builder.mutation<PaymentSuccess, { paymentIntentId: string }>({
            query: ({ paymentIntentId }) => ({
                url: `/confirm-payment/${paymentIntentId}`,
                method: 'POST',
            }),
            invalidatesTags: ['Payment']
        }),

        getPaymentStatus: builder.query<PaymentSuccess, string>({
            query: (sessionId) => ({
                url: `/status/${sessionId}`,
                method: 'GET',
            }),
            providesTags: (_, __, sessionId) => [
                { type: 'Payment', id: sessionId }
            ]
        }),

        refundPayment: builder.mutation<{ success: boolean }, string>({
            query: (sessionId) => ({
                url: `/refund/${sessionId}`,
                method: 'POST',
            }),
            invalidatesTags: ['Payment']
        }),
    })
});

export const {
    useCreatePaymentIntentMutation,
    useCreateCheckoutSessionMutation,
    useConfirmPaymentMutation,
    useGetPaymentStatusQuery,
    useRefundPaymentMutation
} = paymentAPI; 