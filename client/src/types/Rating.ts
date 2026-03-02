import { User } from "./User";

export interface Rating{
    id?: string;  // Changed from _id to id
    raterId?: string;
    value: number;
    doctorId?: string;
    created_at?: string;  // Added missing fields
    updated_at?: string;
}

export interface PopulatedRating {
    id: string;  // Changed from _id to id
    raterId: string;
    value: number;
    doctorId: User;  // Changed to User type
    created_at?: string;  // Added missing fields
    updated_at?: string;
}

// Added for favorites response
export interface FavoriteDoctor {
    doctorId: string;
    rating: number;
    doctor: {
        id: string;
        fullName: string;
        speciality: string;
    };
}