import { useEffect } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "../../utils/errorHandler";

/**
 * Legacy mount-to-toast helper. Prefer `useErrorToast` in new code.
 * Renders nothing — errors are surfaced via toast, not page cards.
 */
const Error = ({ error }: { error: unknown }) => {
  useEffect(() => {
    if (error == null) return;
    const message = extractErrorMessage(error);
    toast.error(message, { id: `err-${message}` });
    // Mount-only so remounts on new failures re-toast
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Error;
