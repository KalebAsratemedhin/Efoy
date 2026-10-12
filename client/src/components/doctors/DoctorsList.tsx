import { useGetDoctorsQuery, useGetSpecialitiesQuery } from "../../redux/api/doctorAPI";
import { PageLoader } from "../utils/Spinner";
import Error from "../utils/Error";
import DoctorCard from "./DoctorCard";
import Pagination, { parsePaginationMeta } from "../utils/Pagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Doctor, DoctorListParams, DoctorSort } from "../../types/User";
import { FaSearch, FaTimes } from "react-icons/fa";
import { readNumberParam } from "../../lib/queryParams";
import AdvancedFilters from "../utils/AdvancedFilters";

const SORT_OPTIONS: { value: DoctorSort; label: string }[] = [
  { value: "rating_desc", label: "Highest rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "experience_desc", label: "Most experienced" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "4.5", label: "4.5+" },
];

const selectClass =
  "h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

interface DoctorsListProps {
  embedded?: boolean;
}

const DoctorsList = ({ embedded = false }: DoctorsListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") ?? "");

  const filters: DoctorListParams = useMemo(() => {
    const sort = searchParams.get("sort") as DoctorSort | null;
    const validSort = SORT_OPTIONS.some((o) => o.value === sort) ? sort! : undefined;
    return {
      page: readNumberParam(searchParams, "page") ?? 1,
      limit: readNumberParam(searchParams, "limit") ?? 9,
      search: searchParams.get("search") || undefined,
      speciality: searchParams.get("speciality") || undefined,
      min_rating: readNumberParam(searchParams, "min_rating"),
      min_experience: readNumberParam(searchParams, "min_experience"),
      max_experience: readNumberParam(searchParams, "max_experience"),
      min_price: readNumberParam(searchParams, "min_price"),
      max_price: readNumberParam(searchParams, "max_price"),
      sort: validSort ?? "rating_desc",
    };
  }, [searchParams]);

  useEffect(() => {
    setSearchDraft(filters.search ?? "");
  }, [filters.search]);

  const patchParams = useCallback(
    (patch: Record<string, string | number | undefined | null>, resetPage = true) => {
      const next = new URLSearchParams(searchParams);
      if (resetPage) next.set("page", "1");
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const { data: specialities = [] } = useGetSpecialitiesQuery(undefined, {
    skip: embedded,
  });

  const { isLoading, isFetching, isSuccess, isError, error, data } = useGetDoctorsQuery(filters);

  const meta = parsePaginationMeta(data, filters.page ?? 1, filters.limit ?? 9);
  const doctors: Doctor[] = data?.items ?? [];
  const totalPages = Math.max(1, meta.totalPages || 1);

  const advancedActive = [
    filters.speciality,
    filters.min_rating != null,
    filters.min_experience != null,
    filters.max_experience != null,
    filters.min_price != null,
    filters.max_price != null,
    filters.sort && filters.sort !== "rating_desc",
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(filters.search || advancedActive > 0);

  const clearFilters = () => {
    setSearchDraft("");
    setSearchParams(new URLSearchParams({ page: "1", limit: String(filters.limit ?? 9) }), {
      replace: true,
    });
  };

  if (isLoading && !data) return <PageLoader label="Loading doctors…" />;
  if (isError) return <Error error={error} />;

  const content = (
    <>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Doctors</h1>
          <p className="text-slate-600 text-sm mt-1">
            Find and book with our medical professionals.
          </p>
        </div>
      )}

      {!embedded && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              patchParams({ search: searchDraft.trim() || undefined });
            }}
          >
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search by name or specialty…"
              className={`${inputClass} pl-10 pr-24`}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
            >
              Search
            </button>
          </form>

          <AdvancedFilters
            forceOpen={advancedActive > 0}
            activeCount={advancedActive}
            actions={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-ink"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear filters
                </button>
              ) : undefined
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Speciality</label>
                <select
                  value={filters.speciality ?? ""}
                  onChange={(e) => patchParams({ speciality: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">All specialities</option>
                  {specialities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Min rating</label>
                <select
                  value={filters.min_rating != null ? String(filters.min_rating) : ""}
                  onChange={(e) =>
                    patchParams({
                      min_rating: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={selectClass}
                >
                  {RATING_OPTIONS.map((o) => (
                    <option key={o.label} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Min experience</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Years"
                  value={filters.min_experience ?? ""}
                  onChange={(e) =>
                    patchParams({
                      min_experience: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Max experience</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Years"
                  value={filters.max_experience ?? ""}
                  onChange={(e) =>
                    patchParams({
                      max_experience: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Min price</label>
                <input
                  type="number"
                  min={0}
                  placeholder="ETB"
                  value={filters.min_price ?? ""}
                  onChange={(e) =>
                    patchParams({
                      min_price: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Max price</label>
                <input
                  type="number"
                  min={0}
                  placeholder="ETB"
                  value={filters.max_price ?? ""}
                  onChange={(e) =>
                    patchParams({
                      max_price: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-xs font-medium text-slate-500 mb-1">Sort</label>
              <select
                value={filters.sort ?? "rating_desc"}
                onChange={(e) => patchParams({ sort: e.target.value })}
                className={selectClass}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </AdvancedFilters>
        </div>
      )}

      {isFetching && data && (
        <p className="text-xs text-slate-500 mb-3">Updating results…</p>
      )}

      {isSuccess && doctors.length === 0 ? (
        <div
          className={
            embedded
              ? "bg-elevated/80 rounded-2xl border border-white/5 p-12 text-center"
              : "bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm"
          }
        >
          <h3 className={`text-lg font-semibold ${embedded ? "text-white" : "text-ink"}`}>
            No doctors found
          </h3>
          <p className={embedded ? "text-slate-400 mt-1" : "text-slate-500 text-sm mt-1"}>
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "No doctors are available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}

      {!embedded && (
        <Pagination
          className="mt-8"
          currentPage={meta.currentPage}
          totalPages={totalPages}
          pageSize={filters.limit ?? 9}
          onPageSizeChange={(size) => patchParams({ limit: size, page: 1 }, false)}
          onPageChange={(page) => patchParams({ page }, false)}
        />
      )}
    </>
  );

  if (embedded) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>;
  }

  return <>{content}</>;
};

export default DoctorsList;
