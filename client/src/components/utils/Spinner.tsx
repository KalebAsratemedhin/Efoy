/**
 * Loading UI — skeleton / shimmer only (no spinners).
 * Kept filename + export names for existing imports.
 */

interface SkeletonProps {
  className?: string;
}

/** Single shimmer bar/block */
export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    className={`relative overflow-hidden rounded-lg bg-slate-200/80 ${className}`}
    aria-hidden="true"
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
  </div>
);

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

/** Compact section skeleton (lists, nested widgets) */
const Spinner = ({ className = "", label }: LoaderProps) => {
  return (
    <div
      className={`w-full space-y-3 py-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
};

/** Full page / route skeleton */
export const PageLoader = ({ label = "Loading…" }: { label?: string }) => (
  <div
    className="w-full max-w-7xl mx-auto space-y-6 py-2"
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <div className="space-y-2">
      <Skeleton className="h-8 w-56 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 min-h-[12rem]">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>

    <span className="sr-only">{label}</span>
  </div>
);

/** Button / inline loading — pulsing dots (no spin) */
export const InlineSpinner = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center gap-1 ${className}`}
    aria-hidden="true"
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80 animate-[pulseDot_1s_ease-in-out_infinite]" />
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80 animate-[pulseDot_1s_ease-in-out_0.15s_infinite]" />
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80 animate-[pulseDot_1s_ease-in-out_0.3s_infinite]" />
  </span>
);

export default Spinner;
