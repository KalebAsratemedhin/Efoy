import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export const DEFAULT_PAGE_SIZE_OPTIONS = [6, 9, 12, 24] as const;

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: readonly number[];
  pageSizeId?: string;
  className?: string;
};

/** Normalize common API pagination shapes into one object. */
export function parsePaginationMeta(
  data: unknown,
  fallbackPage = 1,
  fallbackLimit = 10
): {
  totalPages: number;
  currentPage: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const d = (data ?? {}) as Record<string, unknown>;
  const totalPages = Math.max(1, Number(d.total_pages ?? d.totalPages ?? 1) || 1);
  const currentPage = Number(d.page ?? d.currentPage ?? fallbackPage) || 1;
  const limit = Number(d.limit ?? fallbackLimit) || fallbackLimit;
  const total = Number(d.total ?? d.totalCount ?? 0) || 0;
  const hasNext =
    typeof d.has_next === "boolean"
      ? d.has_next
      : typeof d.hasNext === "boolean"
        ? (d.hasNext as boolean)
        : currentPage < totalPages;
  const hasPrev =
    typeof d.has_prev === "boolean"
      ? d.has_prev
      : typeof d.hasPrev === "boolean"
        ? (d.hasPrev as boolean)
        : currentPage > 1;

  return { totalPages, currentPage, total, limit, hasNext, hasPrev };
}

const Pagination = ({
  currentPage,
  totalPages: rawTotalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pageSizeId = "page-size",
  className = "",
}: PaginationProps) => {
  const totalPages = Math.max(1, rawTotalPages || 1);
  const page = Math.min(Math.max(1, currentPage || 1), totalPages);

  const pages: (number | "ellipsis")[] = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const btnBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}>
      <div className="flex items-center gap-2 order-2 sm:order-1">
        <label htmlFor={pageSizeId} className="text-sm text-slate-600 whitespace-nowrap">
          Page size
        </label>
        <div className="relative">
          <select
            id={pageSizeId}
            value={pageSize ?? pageSizeOptions[0]}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            disabled={!onPageSizeChange}
            className="h-10 w-[4.75rem] appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-60"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnBase} border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50`}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Prev</span>
        </button>

        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`e-${idx}`} className="px-1.5 text-slate-400">
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={page === p ? "page" : undefined}
              className={`${btnBase} px-3 ${
                page === p
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnBase} border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50`}
          aria-label="Next page"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
