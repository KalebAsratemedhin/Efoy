import { useEffect, useState } from 'react';

const FormSuccess = ({ message, duration = 3000 }: { message: string; duration?: number }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer); 
  }, [duration]);

  if (!visible) return null; 

  return (
    <div className="flex justify-center items-center w-full">
      <div className="bg-green-100 text-green-600 border border-green-300 rounded-lg p-4 w-full">
        <div className="flex items-center w-72 h-10 text-wrap">
          <svg
            className="w-10 h-10 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.414l-3.707-3.707a1 1 0 011.414-1.414L11 13.586l5.293-5.293a1 1 0 111.414 1.414L11 16.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-heading">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default FormSuccess;
