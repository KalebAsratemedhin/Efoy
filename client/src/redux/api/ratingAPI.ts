import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Rating, PopulatedRating, FavoriteDoctor } from "../../types/Rating";
const backendUrl = import.meta.env.VITE_BACKEND_URL;


export const ratingAPI = createApi({
    reducerPath: 'ratingAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/rating`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ['Rating', 'Doctor', 'User'],
    endpoints: (builder) => ({
        createRating: builder.mutation<Rating, Rating >({
            query: (credential) => ({
                url: '/',
                method: 'Post',
                body: credential,
                
            }),
            invalidatesTags: ['Rating', 'Doctor']
        }),
        updateRating: builder.mutation<Rating, {id: string, update: Partial<Rating>} >({
            query: ({id, update}) => ({
                url: `/${id}`,
                method: 'Put',
                body: update,
                
            }),
            invalidatesTags: ['Rating', 'Doctor']
        }),
        deleteRating: builder.mutation<void, string >({
            query: (id) => ({
                url: `/${id}`,
                method: 'Delete'
                
            }),
            invalidatesTags: ['Rating', 'Doctor']
        }),

        findCurrentUserRating: builder.query<Rating | null, string>({
            query: (doctorId) => ({
                url: `/${doctorId}`,
                method: 'Get'
            }),
            providesTags: (_, __, doctorId) => [
                { type: 'Rating', id: doctorId }
            ]
        }),
        findCurrentUserFavorites: builder.query<FavoriteDoctor[], void>({
            query: () => ({
                url: `/favorites`,
                method: 'Get'
            }),
            providesTags: ['Rating']
        }),
        // Added missing endpoint
        getDoctorRatings: builder.query<PopulatedRating[], string>({
            query: (doctorId) => ({
                url: `/doctor/${doctorId}/all`,
                method: 'Get'
            }),
            providesTags: (_, __, doctorId) => [
                { type: 'Rating', id: 'LIST' },
                { type: 'Doctor', id: doctorId }
            ]
        })

    })
})

export const {
    useCreateRatingMutation, 
    useUpdateRatingMutation,
    useDeleteRatingMutation,
    useFindCurrentUserRatingQuery,
    useFindCurrentUserFavoritesQuery,
    useGetDoctorRatingsQuery
} = ratingAPI
