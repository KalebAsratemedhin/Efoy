import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const extractErrorMessage = (error: SerializedError | FetchBaseQueryError | string | undefined): string => {
  if (!error) return "An error has occurred.";
  
  // Handle string errors
  if (typeof error === "string") return error;
  
  // Handle FetchBaseQueryError (RTK Query errors)
  if ("data" in error && error.data) {
    if (typeof error.data === "object") {
      // Check for detail field (FastAPI standard)
      if ("detail" in error.data && typeof error.data.detail === "string") {
        return error.data.detail;
      }
      // Check for message field
      if ("message" in error.data && typeof error.data.message === "string") {
        return error.data.message;
      }
    }
  }
  
  // Handle SerializedError
  if ("message" in error && error.message) {
    return error.message;
  }
  
  // Fallback
  return "An error has occurred.";
}; 