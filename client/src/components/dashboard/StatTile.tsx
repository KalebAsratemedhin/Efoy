import { ReactNode } from "react";

type StatTint = "slate" | "amber" | "emerald" | "sky" | "accent";

const tintStyles: Record<StatTint, { icon: string; label: string }> = {
  slate: { icon: "bg-slate-100 text-slate-600", label: "text-slate-500" },
  amber: { icon: "bg-amber-100 text-amber-800", label: "text-amber-800" },
  emerald: { icon: "bg-emerald-100 text-emerald-800", label: "text-emerald-800" },
  sky: { icon: "bg-sky-100 text-sky-700", label: "text-sky-800" },
  accent: { icon: "bg-accent/10 text-accent", label: "text-accent" },
};

interface StatTileProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  tint?: StatTint;
}

const StatTile = ({ label, value, icon, tint = "slate" }: StatTileProps) => {
  const styles = tintStyles[tint];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-xs font-medium ${styles.label}`}>{label}</p>
        <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{value}</p>
      </div>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
      >
        {icon}
      </span>
    </div>
  );
};

export default StatTile;
