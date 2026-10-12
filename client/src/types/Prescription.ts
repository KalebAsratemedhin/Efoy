export interface Prescription {
    id?: string;
    bookingId?: string;
    doctorId?: User;
    patientId?: User;
    medications: string[];
    diagnosis?: string;
    notes?: string;
    status?: string;
    issueDate?: string;
    expiryDate?: string;
    digitalSignature?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PrescriptionCreate {
    bookingId: string;
    medications: string[];
    diagnosis?: string;
    notes?: string;
    expiryDate?: string;
    digitalSignature?: string;
}

export interface PrescriptionUpdate {
    medications?: string[];
    diagnosis?: string;
    notes?: string;
    expiryDate?: string;
    status?: string;
    digitalSignature?: string;
}

export interface PrescriptionPaginatedResponse {
    items: Prescription[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface PatientPrescriptionListParams {
    page?: number;
    limit?: number;
    /** Filter to prescriptions from this doctor user id */
    doctor_id?: string;
}

export interface DoctorPrescriptionListParams {
    page?: number;
    limit?: number;
    /** Filter to prescriptions for this patient user id */
    patient_id?: string;
}

// Import User type from existing types
import { User } from './User'; 