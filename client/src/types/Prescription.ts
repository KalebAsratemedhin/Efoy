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

// Import User type from existing types
import { User } from './User'; 