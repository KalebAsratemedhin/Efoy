import { configureStore } from "@reduxjs/toolkit";
import { authAPI } from "./api/authAPI";
import authReducer from './slices/authSlice'
import { bookingAPI } from "./api/bookingAPI";
import { userAPI } from "./api/userAPI";
import { commentAPI } from "./api/commentAPI";
import { ratingAPI } from "./api/ratingAPI";
import { doctorAPI } from "./api/doctorAPI";
import { dashboardAPI } from "./api/dashboardAPI";
import { videoAPI } from "./api/videoAPI";
import { prescriptionAPI } from "./api/prescriptionAPI";
import { paymentAPI } from "./api/paymentAPI";

export const store = configureStore({
    reducer: {
        [authAPI.reducerPath]: authAPI.reducer,
        auth: authReducer,
        [userAPI.reducerPath]: userAPI.reducer,
        [commentAPI.reducerPath]: commentAPI.reducer,
        [ratingAPI.reducerPath]: ratingAPI.reducer,
        [doctorAPI.reducerPath]: doctorAPI.reducer,
        [bookingAPI.reducerPath]: bookingAPI.reducer,
        [dashboardAPI.reducerPath]: dashboardAPI.reducer,
        [videoAPI.reducerPath]: videoAPI.reducer,
        [prescriptionAPI.reducerPath]: prescriptionAPI.reducer,
        [paymentAPI.reducerPath]: paymentAPI.reducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware()
            .concat(authAPI.middleware)
            .concat(userAPI.middleware)
            .concat(doctorAPI.middleware)
            .concat(bookingAPI.middleware)
            .concat(commentAPI.middleware)
            .concat(ratingAPI.middleware)
            .concat(dashboardAPI.middleware)
            .concat(videoAPI.middleware)
            .concat(prescriptionAPI.middleware)
            .concat(paymentAPI.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
