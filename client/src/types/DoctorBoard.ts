export type PostCategory = "education" | "awareness" | "tips" | "general";
export type PostStatus = "draft" | "published";
export type ReactionValue = "like" | "dislike";
export type ReactionTargetType = "post" | "question" | "answer";

export interface DoctorPost {
  id: string;
  doctorId: string;
  title: string;
  body: string;
  category?: PostCategory | string | null;
  status: PostStatus | string;
  likeCount?: number;
  dislikeCount?: number;
  myReaction?: ReactionValue | null;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorPostListParams {
  page?: number;
  limit?: number;
  category?: PostCategory | string;
  status?: PostStatus | string;
}

export interface DoctorPostCreate {
  title: string;
  body: string;
  category?: PostCategory | string;
  status?: PostStatus | string;
}

export interface DoctorPostUpdate {
  title?: string;
  body?: string;
  category?: PostCategory | string | null;
  status?: PostStatus | string;
}

export type QuestionStatus = "open" | "answered" | "closed";

export interface DoctorQuestion {
  id: string;
  doctorId: string;
  askerId: string;
  askerName?: string | null;
  askerPic?: string | null;
  body: string;
  status: QuestionStatus | string;
  answerBody?: string | null;
  answeredAt?: string | null;
  likeCount?: number;
  dislikeCount?: number;
  myReaction?: ReactionValue | null;
  answerLikeCount?: number;
  answerDislikeCount?: number;
  myAnswerReaction?: ReactionValue | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReactionUpsert {
  targetType: ReactionTargetType;
  targetId: string;
  value: ReactionValue;
}

export interface ReactionOut {
  targetType: ReactionTargetType;
  targetId: string;
  value: ReactionValue | null;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
}

export interface DoctorQuestionListParams {
  page?: number;
  limit?: number;
  status?: QuestionStatus | string;
}

export interface DoctorQuestionCreate {
  doctorId: string;
  body: string;
}

export interface DoctorAnswerBody {
  body: string;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
