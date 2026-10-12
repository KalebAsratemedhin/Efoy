import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import { useGetSpecialitiesQuery } from "../../redux/api/doctorAPI";
import { PageLoader } from "../utils/Spinner";
import BookingCardPatient from "./BookingCardPatient";
import { useErrorToast } from "../../hooks/useErrorToast";
import { authSelector } from "../../redux/slices/authSlice";
import { useSelector } from "react-redux";
import BookingCardDoctor from "./BookingCardDoctor";
import Pagination, { parsePaginationMeta } from "../utils/Pagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaTimes, FaListUl, FaCalendarAlt, FaStream } from "react-icons/fa";
import {
  AppointmentType,
  BookingListParams,
  BookingPopulated,
  BookingSort,
  BookingStatus,
  PaymentStatus,
} from "../../types/Booking";
import { readNumberParam } from "../../lib/queryParams";
import AdvancedFilters from "../utils/AdvancedFilters";
import BookingCalendar from "./BookingCalendar";
import BookingQueue, { buildQueueBookings } from "./BookingQueue";

type AppointmentsView = "list" | "calendar" | "queue";

const todayIsoDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STATUS_OPTIONS: { value: "" | BookingStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "finished", label: "Finished" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS: { value: "" | AppointmentType; label: string }[] = [
  { value: "", label: "All types" },
  { value: "in_person", label: "In-person" },
  { value: "virtual", label: "Virtual" },
];

const PAYMENT_OPTIONS: { value: "" | PaymentStatus; label: string }[] = [
  { value: "", label: "Any payment" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "refunded", label: "Refunded" },
];

const SORT_OPTIONS: { value: BookingSort; label: string }[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
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

const BookingList = () => {
  const authState = useSelector(authSelector);
  const isPatient = authState.role === "patient";
  const isDoctor = authState.role === "doctor";
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") ?? "");

  const viewParam = searchParams.get("view");
  const view: AppointmentsView =
    viewParam === "calendar"
      ? "calendar"
      : viewParam === "queue" && isDoctor
        ? "queue"
        : "list";

  const filters: BookingListParams = useMemo(() => {
    const status = searchParams.get("status") as BookingStatus | null;
    const appointment_type = searchParams.get("appointment_type") as AppointmentType | null;
    const payment_status = searchParams.get("payment_status") as PaymentStatus | null;
    const sort = searchParams.get("sort") as BookingSort | null;
    const isCalendar = searchParams.get("view") === "calendar";
    const isQueue = searchParams.get("view") === "queue" && isDoctor;

    const validStatus = STATUS_OPTIONS.some((o) => o.value === status) ? status! : undefined;
    const validType = TYPE_OPTIONS.some((o) => o.value === appointment_type)
      ? appointment_type!
      : undefined;
    const validPayment = PAYMENT_OPTIONS.some((o) => o.value === payment_status)
      ? payment_status!
      : undefined;
    const validSort = SORT_OPTIONS.some((o) => o.value === sort) ? sort! : "date_desc";

    return {
      page: isCalendar ? 1 : readNumberParam(searchParams, "page") ?? 1,
      limit: isCalendar ? 100 : readNumberParam(searchParams, "limit") ?? 6,
      search: searchParams.get("search") || undefined,
      status: validStatus || undefined,
      appointment_type: validType || undefined,
      payment_status: validPayment || undefined,
      date_from: isQueue ? todayIsoDate() : searchParams.get("date_from") || undefined,
      date_to: isQueue ? undefined : searchParams.get("date_to") || undefined,
      speciality: isPatient ? searchParams.get("speciality") || undefined : undefined,
      min_rating: isPatient ? readNumberParam(searchParams, "min_rating") : undefined,
      sort: isQueue ? "date_asc" : validSort,
    };
  }, [searchParams, isPatient, isDoctor]);

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

  const { data: specialities = [] } = useGetSpecialitiesQuery(undefined, { skip: !isPatient });
  const { isSuccess, isError, isLoading, isFetching, error, data, refetch } =
    useFindCurrentUserBookingsQuery(filters);

  const meta = parsePaginationMeta(data, filters.page ?? 1, filters.limit ?? 6);
  const bookings: BookingPopulated[] = Array.isArray(data?.items) ? data.items : [];
  const queueBookings = useMemo(
    () => (view === "queue" ? buildQueueBookings(bookings) : []),
    [view, bookings]
  );
  const totalPages = Math.max(1, meta.totalPages || 1);

  const advancedActive = [
    filters.appointment_type,
    filters.payment_status,
    view !== "queue" && filters.date_from,
    filters.date_to,
    filters.speciality,
    filters.min_rating != null,
    view !== "queue" && filters.sort && filters.sort !== "date_desc",
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(filters.search || filters.status || advancedActive > 0);

  const clearFilters = () => {
    setSearchDraft("");
    const next = new URLSearchParams();
    next.set("page", "1");
    next.set("limit", view === "calendar" ? "100" : String(filters.limit ?? 6));
    if (view === "calendar") next.set("view", "calendar");
    if (view === "queue") next.set("view", "queue");
    setSearchParams(next, { replace: true });
  };

  const setView = (nextView: AppointmentsView) => {
    const next = new URLSearchParams(searchParams);
    if (nextView === "calendar") {
      next.set("view", "calendar");
      next.delete("page");
    } else if (nextView === "queue") {
      next.set("view", "queue");
      next.set("page", "1");
      if (!next.get("limit")) next.set("limit", "6");
      next.delete("date_from");
      next.delete("date_to");
      next.delete("sort");
    } else {
      next.delete("view");
      if (!next.get("page")) next.set("page", "1");
      if (!next.get("limit")) next.set("limit", "6");
    }
    setSearchParams(next, { replace: true });
  };

  useErrorToast(isError, error, "bookings-list");

  if (isLoading && !data) return <PageLoader label="Loading appointments…" />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Appointments</h1>
          <p className="text-slate-600 text-sm mt-1">
            {view === "queue"
              ? "Upcoming appointments from now onward, soonest first."
              : "View and manage your appointments."}
          </p>
        </div>

        <div
          className="inline-flex self-start rounded-xl bg-slate-100 p-1 shadow-inner"
          role="tablist"
          aria-label="Appointments view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "list"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <FaListUl className="w-3.5 h-3.5" />
            List
          </button>
          {isDoctor && (
            <button
              type="button"
              role="tab"
              aria-selected={view === "queue"}
              onClick={() => setView("queue")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                view === "queue"
                  ? "bg-white text-ink shadow-sm"
                  : "text-slate-600 hover:text-ink"
              }`}
            >
              <FaStream className="w-3.5 h-3.5" />
              Queue
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={view === "calendar"}
            onClick={() => setView("calendar")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "calendar"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <FaCalendarAlt className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
      </div>

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
            placeholder={`Search by ${isPatient ? "doctor" : "patient"} name…`}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            className={`${inputClass} pl-10 pr-24`}
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
          >
            Search
          </button>
        </form>

        <div
          className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => {
            const active = (filters.status ?? "") === opt.value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => patchParams({ status: opt.value || undefined })}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-white text-ink shadow-sm" : "text-slate-600 hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {view === "list" && (
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
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
                isPatient ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4"
              }`}
            >
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                <select
                  value={filters.appointment_type ?? ""}
                  onChange={(e) =>
                    patchParams({ appointment_type: e.target.value || undefined })
                  }
                  className={selectClass}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.label} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Payment</label>
                <select
                  value={filters.payment_status ?? ""}
                  onChange={(e) =>
                    patchParams({ payment_status: e.target.value || undefined })
                  }
                  className={selectClass}
                >
                  {PAYMENT_OPTIONS.map((o) => (
                    <option key={o.label} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.date_from ?? ""}
                  onChange={(e) => patchParams({ date_from: e.target.value || undefined })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.date_to ?? ""}
                  onChange={(e) => patchParams({ date_to: e.target.value || undefined })}
                  className={inputClass}
                />
              </div>

              {isPatient && (
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
              )}

              {isPatient && (
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
              )}
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-xs font-medium text-slate-500 mb-1">Sort</label>
              <select
                value={filters.sort ?? "date_desc"}
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
        )}

        {(view === "calendar" || view === "queue") && hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-ink"
          >
            <FaTimes className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {isFetching && data && (
        <p className="text-xs text-slate-500 mb-3">Updating results…</p>
      )}

      {view === "calendar" ? (
        <BookingCalendar
          bookings={bookings}
          emptyHint={
            hasActiveFilters
              ? "No appointments match your filters."
              : "You don't have any appointments yet."
          }
        />
      ) : view === "queue" ? (
        <BookingQueue
          bookings={queueBookings}
          refetch={refetch}
          startIndex={((filters.page ?? 1) - 1) * (filters.limit ?? 6)}
          emptyHint={
            hasActiveFilters
              ? "No upcoming appointments match your filters."
              : "No upcoming appointments in the queue."
          }
        />
      ) : isError || (isSuccess && bookings.length === 0) ? (
        <div className="border border-dashed border-slate-200 rounded-xl bg-white py-12 px-6 text-center">
          <p className="text-slate-600 text-sm">
            {isError
              ? "Appointments couldn’t be loaded. Please try again."
              : hasActiveFilters
                ? "No appointments match your filters."
                : "You don't have any appointments yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
          {bookings.map((booking) =>
            isPatient ? (
              <BookingCardPatient key={booking.id} booking={booking} refetch={refetch} />
            ) : (
              <BookingCardDoctor key={booking.id} booking={booking} refetch={refetch} />
            )
          )}
        </div>
      )}

      {(view === "list" || view === "queue") && (
        <Pagination
          className="mt-8"
          currentPage={meta.currentPage}
          totalPages={totalPages}
          pageSize={filters.limit ?? 6}
          onPageSizeChange={(size) => patchParams({ limit: size, page: 1 }, false)}
          onPageChange={(page) => patchParams({ page }, false)}
        />
      )}
    </div>
  );
};

export default BookingList;
