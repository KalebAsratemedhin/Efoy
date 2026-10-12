import { useEffect } from "react";
import { toast } from "sonner";

/** Fires a success toast when mounted (pair with `{isSuccess && <FormSuccess … />}`). */
const FormSuccess = ({
  message,
}: {
  message: string;
  duration?: number;
}) => {
  useEffect(() => {
    if (!message) return;
    toast.success(message, { id: `ok-${message}` });
    // Mount-only: parent remounts on each successful action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default FormSuccess;
