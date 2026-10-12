import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  /** Distance from bottom (px) that triggers the next page. */
  threshold?: number;
}

/** Attach to a scrollable container; calls onLoadMore near the bottom. */
export function useInfiniteScroll({
  hasMore,
  isFetching,
  onLoadMore,
  threshold = 64,
}: UseInfiniteScrollOptions) {
  const ref = useRef<HTMLDivElement | null>(null);
  const locked = useRef(false);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el || !hasMore || isFetching || locked.current) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining <= threshold) {
      locked.current = true;
      onLoadMore();
    }
  }, [hasMore, isFetching, onLoadMore, threshold]);

  useEffect(() => {
    if (!isFetching) locked.current = false;
  }, [isFetching]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return ref;
}
