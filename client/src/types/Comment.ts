import { User } from "./User";

export interface CommentI{
    id?: string;  // Changed from _id to id
    commenterId?: string;  // Changed to string to match backend
    commenterName?: string;
    commenterPic?: string;
    content: string;
    doctorId: string;
    rating?: number;
    created_at?: string;  // Added missing fields
    updated_at?: string;
}

// Added for populated comment responses
export interface CommentPopulated {
    id: string;
    commenterId: User | string;
    commenterName?: string;
    commenterPic?: string;
    doctorId: string | User;
    content: string;
    created_at?: string;
    updated_at?: string;
}

export interface CommentListParams {
    doctorId: string;
    page?: number;
    limit?: number;
}

export interface CommentPaginatedResponse {
    items: CommentPopulated[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}