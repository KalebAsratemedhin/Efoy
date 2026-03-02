import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCreditCard, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useCreateCheckoutSessionMutation, useGetPaymentStatusQuery } from '../redux/api/paymentAPI';
import { useGetCurrentUserQuery } from '../redux/api/userAPI';
import { useFindOneBookingQuery } from '../redux/api/bookingAPI';
import { AppointmentPayment } from '../types/Payment';

const Payment: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const { data: userData } = useGetCurrentUserQuery();
  
  const [createCheckoutSession, { isLoading: isCreatingSession, isError: isSessionError }] = useCreateCheckoutSessionMutation();
  const { data: paymentStatus, isLoading: isStatusLoading } = useGetPaymentStatusQuery(sessionId!, { skip: !sessionId });
  
  // Fetch the actual booking data to get real payment amount and details
  const { data: bookingData, isLoading: isBookingLoading } = useFindOneBookingQuery(bookingId!, { skip: !bookingId });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const hasAttemptedRedirect = useRef(false);

  // Check if this is a redirect from Stripe (has session_id but no bookingId)
  const isStripeRedirect = sessionId && !bookingId;

  // Handle payment status when session ID is present
  useEffect(() => {
    if (sessionId && paymentStatus) {
      if (paymentStatus.status === 'completed') {
        setShowSuccess(true);
        setPaymentData({
          sessionId: sessionId,
          bookingId: paymentStatus.bookingId,
          amount: paymentStatus.amount,
          status: 'completed'
        });
      }
    }
  }, [sessionId, paymentStatus]);

  // Handle checkout session creation
  useEffect(() => {
    // Only proceed if this is NOT a Stripe redirect and we have all required data
    if (isStripeRedirect) return;
    
    if (!sessionId && bookingId && userData && bookingData && !hasAttemptedRedirect.current) {
      hasAttemptedRedirect.current = true;
      
      // Validate that we have all required data
      if (!bookingData.paymentAmount || !bookingData.paymentCurrency) {
        hasAttemptedRedirect.current = false;
        return;
      }
      
      const appointmentData: AppointmentPayment = {
        bookingId: bookingId,
        amount: bookingData.paymentAmount,
        currency: bookingData.paymentCurrency,
        description: 'Appointment consultation fee',
        patientName: userData.fullName || 'Unknown',
        doctorName: bookingData.doctorId?.fullName || 'Dr. Unknown',
        appointmentDate: bookingData.appointmentDate || 'Unknown',
        appointmentTime: bookingData.time || 'Unknown'
      };

      createCheckoutSession(appointmentData)
        .unwrap()
        .then((result) => {
          if (result.url) {
            // Redirect to Stripe checkout immediately
            window.location.href = result.url;
          } else {
            hasAttemptedRedirect.current = false; // Allow retry
          }
        })
        .catch((error) => {
          console.error('❌ Failed to create checkout session:', error);
          hasAttemptedRedirect.current = false; // Allow retry
        });
    }
  }, [sessionId, bookingId, userData, bookingData, createCheckoutSession, isStripeRedirect]);

  // Show success page if payment was completed
  if (showSuccess && paymentData) {
    navigate(`/payment/success?session_id=${sessionId}`);
    return null;
  }

  // If this is a Stripe redirect, handle payment status
  if (isStripeRedirect) {
    if (isStatusLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="text-blue-600 text-4xl mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        </div>
      );
    }

    if (paymentStatus && paymentStatus.status !== 'completed') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Completed</h2>
            <p className="text-gray-600 mb-4">Your payment was not completed successfully.</p>
            <button
              onClick={() => navigate('/appointments')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      );
    }
  }

  // Show loading while fetching booking data
  if (isBookingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-blue-600 text-4xl mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Booking Details</h2>
          <p className="text-gray-600">Please wait while we fetch your appointment information...</p>
        </div>
      </div>
    );
  }

  // Show error if booking data failed to load
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your appointment details.</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Show loading while creating checkout session
  if (isCreatingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-blue-600 text-4xl mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing Payment</h2>
          <p className="text-gray-600">Creating your secure payment session...</p>
        </div>
      </div>
    );
  }

  // Show error if session creation failed
  if (isSessionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">Failed to create payment session. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Show initial payment preparation message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FaCreditCard className="text-blue-600 text-4xl mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing Payment</h2>
        <p className="text-gray-600">Setting up your secure payment session...</p>
        <div className="mt-4">
          <FaSpinner className="text-blue-600 text-2xl mx-auto animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default Payment; 