export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface PaymentSession {
  sessionId: string;
  url?: string;
}

export interface AppointmentPayment {
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export interface PaymentSuccess {
  sessionId: string;
  bookingId: string;
  amount: number;
  status: string;
  currency?: string;
} 