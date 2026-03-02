import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../redux/api/authAPI';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/slices/authSlice';
import Spinner from '../components/utils/Spinner';
import FormSuccess from '../components/utils/FormSuccess';
import FormError from '../components/utils/FormError';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const hasAttemptedVerification = useRef(false);
  const hasRedirected = useRef(false);

  const [verifyEmail, { isLoading: isVerifying, isSuccess: isVerified, error: verifyError, data: verifyData }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending, isSuccess: isResent, error: resendError }] = useResendVerificationMutation();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token && !hasAttemptedVerification.current) {
      hasAttemptedVerification.current = true;
      verifyEmail(token);
    }
  }, [token]); // Removed verifyEmail from dependencies

  useEffect(() => {
    if (isVerified && verifyData && !hasRedirected.current) {
      // Auto-login after successful verification and redirect immediately
      hasRedirected.current = true;
      dispatch(setAuth(verifyData));
      navigate('/dashboard');
    }
  }, [isVerified, verifyData, dispatch, navigate]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      resendVerification(email);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <Spinner />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Verifying your email...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <FormSuccess message="Email verified successfully! You are now logged in and being redirected to your dashboard." />
          <div className="mt-6 text-center">
            <Spinner />
            <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <FormError error="Email verification failed. The link may be invalid or expired." />
          <div className="mt-6">
            <button
              onClick={() => setShowResendForm(true)}
              className="w-full bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResendForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Resend Verification Email</h2>
          
          {isResent && <FormSuccess message="Verification email sent successfully! Please check your inbox." />}
          {resendError && <FormError error="Failed to send verification email. Please try again." />}
          
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isResending}
              className="w-full bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {isResending ? <Spinner /> : 'Send Verification Email'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/signin')}
              className="text-accent hover:text-accent-hover text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification</h2>
          <p className="text-gray-600 mb-6">
            Please check your email for the verification link. If you haven't received it, you can request a new one.
          </p>
          <button
            onClick={() => setShowResendForm(true)}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 