import { ReactNode, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface AdvancedFiltersProps {
  children: ReactNode;
  /** When true, panel opens (e.g. URL already has advanced params). */
  forceOpen?: boolean;
  activeCount?: number;
  actions?: ReactNode;
  className?: string;
}

const AdvancedFilters = ({
  children,
  forceOpen = false,
  activeCount = 0,
  actions,
  className = "",
}: AdvancedFiltersProps) => {
  const [open, setOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-ink"
        >
          <FaChevronDown
            className={`w-3 h-3 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          />
          Advanced filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
              {activeCount}
            </span>
          )}
        </button>
        {actions}
      </div>

      {open && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
};

export default AdvancedFilters;
