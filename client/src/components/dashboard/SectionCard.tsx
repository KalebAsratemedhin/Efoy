import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

const SectionCard = ({
  title,
  viewAllTo,
  viewAllLabel = "View all",
  children,
  className = "",
  bodyClassName = "",
}: SectionCardProps) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm p-5 ${className}`}
    >
      <div className="flex justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="text-slate-600 hover:text-ink text-sm font-medium shrink-0"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};

export default SectionCard;
