interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "h-5 w-5 border-2",
  md: "h-9 w-9 border-[3px]",
  lg: "h-12 w-12 border-4",
};

const Spinner = ({ size = "md", className = "", label }: SpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <div
        className={`${sizeMap[size]} rounded-full border-slate-200 border-t-accent animate-spin`}
      />
      {label && <p className="text-sm text-slate-500 font-medium">{label}</p>}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
};

/** Centered page/section loader with light breathing background */
export const PageLoader = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex min-h-[240px] w-full items-center justify-center rounded-xl bg-white/60 py-16">
    <Spinner size="lg" label={label} />
  </div>
);

/** Compact inline spinner for buttons / card actions */
export const InlineSpinner = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
    aria-hidden="true"
  />
);

export default Spinner;
