import { User } from "./User";

export interface CommentI{
    id?: string;  // Changed from _id to id
    commenterId?: string;  // Changed to string to match backend
    content: string;
    doctorId: string;
    created_at?: string;  // Added missing fields
    updated_at?: string;
}

// Added for populated comment responses
export interface CommentPopulated {
    id: string;
    commenterId: User;  // Populated user object
    doctorId: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}