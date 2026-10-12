import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "../../utils/errorHandler";

/** Fires an error toast when mounted (pair with `{isError && <FormError … />}`). */
const FormError = ({
  error,
}: {
  error: SerializedError | FetchBaseQueryError | string | undefined;
  duration?: number;
}) => {
  useEffect(() => {
    if (!error) return;
    const message = extractErrorMessage(error);
    toast.error(message, { id: `err-${message}` });
    // Mount-only: parent remounts on each failed action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default FormError;
