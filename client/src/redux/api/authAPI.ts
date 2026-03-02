import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthResponse, SigninCredential, SignupCredential } from "../../types/User";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface SignupResponse {
    message: string;
    id: string;
    email: string;
}

interface VerificationResponse {
    message: string;
}

export const authAPI = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/auth`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ['User', 'Auth'],
    endpoints: (builder) => ({
        signup: builder.mutation<SignupResponse, SignupCredential >({
            query: (credential) => ({
                url: '/signup',
                method: 'Post',
                body: credential,
                
            }),
            invalidatesTags: ['User', 'Auth']
        }),
        signin: builder.mutation<AuthResponse, SigninCredential >({
            query: (credential) => ({
                url: '/signin',
                method: 'Post',
                body: credential,
                
            }),
            invalidatesTags: ['User', 'Auth']
        }),
        signout: builder.mutation<void, void >({
            query: () => ({
                url: '/signout',
                method: 'Post'
                
            }),
            invalidatesTags: ['User', 'Auth']
        }),
        verifyEmail: builder.mutation<AuthResponse, string>({
            query: (token) => ({
                url: `/verify-email?token=${token}`,
                method: 'Get'
            }),
            invalidatesTags: ['User', 'Auth']
        }),
        resendVerification: builder.mutation<VerificationResponse, string>({
            query: (email) => ({
                url: '/resend-verification',
                method: 'Post',
                body: { email }
            })
        }),
        googleAuth: builder.query<void, void>({
            query: () => ({
                url: '/google'
            })
        })
        
    })
})

export const {
    useSigninMutation, 
    useSignupMutation,
    useSignoutMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useGoogleAuthQuery
} = authAPI
