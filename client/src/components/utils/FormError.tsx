import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { extractErrorMessage } from "../../utils/errorHandler";

const FormError = ({ error, duration = 3000 }: { error: SerializedError | FetchBaseQueryError | string | undefined, duration?: number}) => {
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
        <div className="bg-red-100 text-red-600 border border-red-300 rounded-lg p-4 w-full">
          <div className="flex items-center  w-72 h-10 text-wrap">
            <svg
              className="w-15 h-10 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"
              />
            </svg>
            <span className="font-heading">{extractErrorMessage(error)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default FormError;
  