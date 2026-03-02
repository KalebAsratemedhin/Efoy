import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/slices/authSlice";
import Spinner from "../components/utils/Spinner";

const GoogleAuth = () => {
  const [searchParams] = useSearchParams() 
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const accessToken = searchParams.get('token');
    const errorMessage = searchParams.get('message');

    if (errorMessage) {
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    if (id && role && accessToken) {
      // Store token in localStorage
      localStorage.setItem('accessToken', accessToken);
      
      // Update Redux state
      dispatch(setAuth({ id, role, accessToken }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  }, [searchParams, navigate, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Authenticating with Google...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-2/3 max-w-md flex justify-center items-center flex-col bg-white rounded-md p-8 shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/signin')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default GoogleAuth



