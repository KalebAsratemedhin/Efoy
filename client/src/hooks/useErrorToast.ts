import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "../utils/errorHandler";

/**
 * Shows a toast when a query/mutation error becomes active.
 * Prefer this over rendering the old on-page error card.
 */
export function useErrorToast(isError: boolean, error: unknown, toastId?: string) {
  const lastMessage = useRef<string | null>(null);

  useEffect(() => {
    if (!isError || error == null) {
      lastMessage.current = null;
      return;
    }
    const message = extractErrorMessage(error);
    if (lastMessage.current === message) return;
    lastMessage.current = message;
    toast.error(message, { id: toastId ?? `err-${message}` });
  }, [isError, error, toastId]);
}
