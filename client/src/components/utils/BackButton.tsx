import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

type BackButtonProps = {
  label?: string;
  className?: string;
} & (
  | { to: string; onClick?: never }
  | { onClick: () => void; to?: never }
);

const baseClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/30";

const BackButton = ({
  label = "Back",
  className = "",
  ...props
}: BackButtonProps) => {
  const content = (
    <>
      <FaArrowLeft className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
      <span>{label}</span>
    </>
  );

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={`${baseClass} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`${baseClass} ${className}`}
    >
      {content}
    </button>
  );
};

export default BackButton;
