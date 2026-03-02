export interface DoctorCreate {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  sex?: 'male' | 'female' | 'other';
  address?: string;
  age?: number;
  profilePic?: string;
  orgID: string;
  speciality: string;
  experience: string;
  educationLevel: string;
} 