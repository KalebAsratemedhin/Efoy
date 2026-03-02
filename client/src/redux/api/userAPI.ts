import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AdminStats, Doctor, User, UserUpdate, PaginatedResponse } from "../../types/User";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/user`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ['User', 'Doctor'],
    endpoints: (builder) => ({
        getCurrentUser: builder.query<User, void>({
            query: () => ({
                url: '/current-user',
                method: 'Get'
            }),
            providesTags: ['User']
        }),

        findOneDoctor: builder.query<Doctor, string>({
            query: (id) => ({
                url: `/doctor/${id}`,
                method: 'Get'
            }),
            providesTags: (_, __, id) => [
                { type: 'Doctor', id }
            ]
        }),

        findAllDoctors: builder.query<PaginatedResponse<Doctor>, {page: number, limit: number}>({
            query: ({ page = 1, limit = 10 }) => ({
                url: `/doctor?page=${page}&limit=${limit}`,
                method: 'Get'
            }),
            providesTags: ['Doctor']
        }),

        updateUser: builder.mutation<User, {id: string, update: UserUpdate}>({
            query: ({id, update}) => ({
                url: `/${id}`,
                method: 'Put',
                body: update,
                
            }),
            invalidatesTags: ['User']
        }),

        updateProfilePicture: builder.mutation<User, {id: string, file: File}>({
            query: ({id, file}) => {
                const formData = new FormData();
                formData.append('file', file);
                
                return {
                    url: `/profile-pic/${id}`,
                    method: 'Put',
                    body: formData,
                }
            },
            invalidatesTags: ['User']
        }),

        searchDoctors: builder.query<Doctor[], string>({
            query: (searchTerm) => ({
               url: `/doctor?search=${searchTerm}`,
               method: 'Get'
            }),
            providesTags: ['Doctor']
        }),

        adminStats: builder.query<AdminStats, void>({
            query: () => ({
               url: '/admin-stats',
               method: 'Get'
            })
        }),

        // Added missing endpoints
        getAllUsers: builder.query<PaginatedResponse<User>, {page: number, limit: number}>({
            query: ({ page = 1, limit = 10 }) => ({
                url: `?page=${page}&limit=${limit}`,
                method: 'Get'
            }),
            providesTags: ['User']
        }),

        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: 'Delete'
            }),
            invalidatesTags: ['User', 'Doctor']
        }),

    })
})

export const {
    useGetCurrentUserQuery,
    useFindOneDoctorQuery,
    useFindAllDoctorsQuery,
    useSearchDoctorsQuery,
    useUpdateUserMutation,
    useUpdateProfilePictureMutation,
    useAdminStatsQuery,
    useGetAllUsersQuery,
    useDeleteUserMutation
} = userAPI
