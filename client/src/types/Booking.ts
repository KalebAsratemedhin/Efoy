import { User } from "./User";

export type BookingStatus = "pending" | "confirmed" | "finished" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded";
export type AppointmentType = "in_person" | "virtual";
export type BookingSort = "date_desc" | "date_asc";

export interface Booking {
    id?: string;
    patientId?: string;
    doctorId?: string;
    appointmentDate: string;
    time: string;
    reason: string;
    status?: BookingStatus | string;
    paymentStatus?: PaymentStatus | string;
    paymentId?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    appointmentType?: AppointmentType | string;
    streamCallId?: string;
    callStartedAt?: string;
    callEndedAt?: string;
    callDuration?: number;
    created_at?: string;
    updated_at?: string;
}

export interface BookingPopulated {
    id?: string;
    patientId?: User;
    doctorId: User;
    doctorData: {
        id?: string;
        speciality: string;
        experience: string;
        educationLevel: string;
        rating?: number;
        orgID: string;
        sessionPrice?: number;
        workingHours?: Record<string, { start: string; end: string }>;
        created_at?: string;
        updated_at?: string;
    };
    appointmentDate: string;
    time: string;
    reason: string;
    status?: BookingStatus | string;
    paymentStatus?: PaymentStatus | string;
    paymentId?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    appointmentType?: AppointmentType | string;
    streamCallId?: string;
    callStartedAt?: string;
    callEndedAt?: string;
    callDuration?: number;
    created_at?: string;
    updated_at?: string;
}

export interface BookingPaginatedResponse {
    items: BookingPopulated[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface BookingListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: BookingStatus;
    appointment_type?: AppointmentType;
    payment_status?: PaymentStatus;
    date_from?: string;
    date_to?: string;
    speciality?: string;
    min_rating?: number;
    sort?: BookingSort;
}
