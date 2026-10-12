import { ReactNode } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { Skeleton } from "./Spinner";

interface InfiniteScrollContainerProps {
  children: ReactNode;
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  className?: string;
  /** Tailwind max-height utility, default max-h-96 */
  maxHeightClassName?: string;
  empty?: boolean;
}

const InfiniteScrollContainer = ({
  children,
  hasMore,
  isFetching,
  onLoadMore,
  className = "",
  maxHeightClassName = "max-h-96",
  empty = false,
}: InfiniteScrollContainerProps) => {
  const scrollRef = useInfiniteScroll({ hasMore, isFetching, onLoadMore });

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto overscroll-contain pr-1 ${maxHeightClassName} ${className}`}
    >
      {children}
      {!empty && isFetching && hasMore && (
        <div className="py-3 space-y-2" aria-hidden="true">
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      {!empty && !hasMore && !isFetching && (
        <p className="text-center text-xs text-slate-400 py-3">You’re all caught up</p>
      )}
    </div>
  );
};

export default InfiniteScrollContainer;
