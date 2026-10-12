import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaNotesMedical,
  FaPills,
  FaStethoscope,
} from "react-icons/fa";
import { authSelector } from "../../redux/slices/authSlice";
import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import {
  useGetDoctorPrescriptionsQuery,
  useGetPatientPrescriptionsQuery,
} from "../../redux/api/prescriptionAPI";
import { Prescription } from "../../types/Prescription";
import PrescriptionDisplay from "./PrescriptionDisplay";
import { formatTime } from "../../utils/timeUtils";
import { Skeleton } from "../utils/Spinner";
import { parsePaginationMeta } from "../utils/Pagination";

interface CareHistorySectionProps {
  doctorUserId: string;
  patientUserId: string;
  currentBookingId?: string;
}

const PAGE_SIZE = 4;

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const CarouselNav = ({
  page,
  totalPages,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  disabled,
}: {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-slate-400 tabular-nums hidden sm:inline">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled || !hasPrev}
        aria-label="Previous page"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-accent/40 hover:text-accent disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
      >
        <FaChevronLeft className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || !hasNext}
        aria-label="Next page"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-accent/40 hover:text-accent disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
      >
        <FaChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

const CareHistorySection = ({
  doctorUserId,
  patientUserId,
  currentBookingId,
}: CareHistorySectionProps) => {
  const auth = useSelector(authSelector);
  const isDoctor = auth.role === "doctor";
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [prescriptionsPage, setPrescriptionsPage] = useState(1);

  const canQuery = Boolean(doctorUserId && patientUserId);

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isFetching: bookingsFetching,
  } = useFindCurrentUserBookingsQuery(
    {
      page: appointmentsPage,
      limit: PAGE_SIZE,
      status: "finished",
      sort: "date_desc",
      exclude_id: currentBookingId,
      ...(isDoctor ? { patient_id: patientUserId } : { doctor_id: doctorUserId }),
    },
    { skip: !canQuery }
  );

  const {
    data: patientRx,
    isLoading: patientRxLoading,
    isFetching: patientRxFetching,
  } = useGetPatientPrescriptionsQuery(
    { page: prescriptionsPage, limit: PAGE_SIZE, doctor_id: doctorUserId },
    { skip: isDoctor || !canQuery }
  );

  const {
    data: doctorRx,
    isLoading: doctorRxLoading,
    isFetching: doctorRxFetching,
  } = useGetDoctorPrescriptionsQuery(
    { page: prescriptionsPage, limit: PAGE_SIZE, patient_id: patientUserId },
    { skip: !isDoctor || !canQuery }
  );

  const previousAppointments = bookingsData?.items ?? [];
  const pairPrescriptions = (isDoctor ? doctorRx?.items : patientRx?.items) ?? [];
  const rxLoading = isDoctor ? doctorRxLoading : patientRxLoading;
  const rxFetching = isDoctor ? doctorRxFetching : patientRxFetching;
  const rxData = isDoctor ? doctorRx : patientRx;

  const appointmentsMeta = parsePaginationMeta(bookingsData, appointmentsPage, PAGE_SIZE);
  const prescriptionsMeta = parsePaginationMeta(rxData, prescriptionsPage, PAGE_SIZE);

  return (
    <section className="w-full text-left space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink tracking-tight">Care history</h2>
        <p className="text-sm text-slate-500 mt-1">
          Finished visits and prescriptions for this doctor–patient pair.
        </p>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                <FaStethoscope className="w-3 h-3" />
              </span>
              <h3 className="text-sm font-semibold text-ink">Previous appointments</h3>
              {!bookingsLoading && (
                <span className="text-xs text-slate-400">{appointmentsMeta.total}</span>
              )}
            </div>
            <CarouselNav
              page={appointmentsMeta.currentPage}
              totalPages={Math.max(1, appointmentsMeta.totalPages || 1)}
              hasPrev={appointmentsMeta.hasPrev}
              hasNext={appointmentsMeta.hasNext}
              disabled={bookingsFetching}
              onPrev={() => setAppointmentsPage((p) => Math.max(1, p - 1))}
              onNext={() => setAppointmentsPage((p) => p + 1)}
            />
          </div>

          {bookingsLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              role="status"
              aria-label="Loading appointments"
            >
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : previousAppointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center">
              <FaCalendarAlt className="mx-auto text-slate-300 w-5 h-5 mb-2" />
              <p className="text-sm text-slate-600">No previous appointments</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-200 ${
                bookingsFetching ? "opacity-55" : "opacity-100"
              }`}
            >
              {previousAppointments.map((booking) => {
                const card = (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium text-ink truncate">
                          {formatDate(booking.appointmentDate)}
                        </p>
                        {booking.time && (
                          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <FaClock className="w-2.5 h-2.5" />
                            {formatTime(booking.time)}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800 capitalize">
                        {booking.status || "finished"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                      {booking.reason || "No reason noted"}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize mt-2">
                      {booking.appointmentType?.replace("_", " ") || "Appointment"}
                    </p>
                  </>
                );

                const className =
                  "block rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm hover:border-accent/40 hover:shadow-md hover:bg-slate-50/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

                return booking.id ? (
                  <Link
                    key={booking.id}
                    to={`/appointments/${booking.id}`}
                    className={className}
                    aria-label={`Open appointment on ${formatDate(booking.appointmentDate)}`}
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={booking.appointmentDate + (booking.time ?? "")} className={className}>
                    {card}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <FaPills className="w-3 h-3" />
              </span>
              <h3 className="text-sm font-semibold text-ink">Prescriptions</h3>
              {!rxLoading && (
                <span className="text-xs text-slate-400">{prescriptionsMeta.total}</span>
              )}
            </div>
            <CarouselNav
              page={prescriptionsMeta.currentPage}
              totalPages={Math.max(1, prescriptionsMeta.totalPages || 1)}
              hasPrev={prescriptionsMeta.hasPrev}
              hasNext={prescriptionsMeta.hasNext}
              disabled={rxFetching}
              onPrev={() => setPrescriptionsPage((p) => Math.max(1, p - 1))}
              onNext={() => setPrescriptionsPage((p) => p + 1)}
            />
          </div>

          {rxLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              role="status"
              aria-label="Loading prescriptions"
            >
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : pairPrescriptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center">
              <FaNotesMedical className="mx-auto text-slate-300 w-5 h-5 mb-2" />
              <p className="text-sm text-slate-600">No prescriptions yet</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-200 ${
                rxFetching ? "opacity-55" : "opacity-100"
              }`}
            >
              {pairPrescriptions.map((prescription) => (
                <button
                  key={prescription.id}
                  type="button"
                  onClick={() => setSelectedPrescription(prescription)}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm hover:border-emerald-300/70 hover:shadow-md hover:bg-emerald-50/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                  aria-label={`Open prescription ${
                    prescription.diagnosis || prescription.id?.slice(-8) || ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-ink line-clamp-2 min-w-0">
                      {prescription.diagnosis ||
                        (prescription.id
                          ? `Rx #${prescription.id.slice(-8)}`
                          : "Prescription")}
                    </p>
                    <span
                      className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                        prescription.status === "active"
                          ? "bg-green-100 text-green-800"
                          : prescription.status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {prescription.status || "—"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {formatDate(prescription.issueDate)}
                  </p>
                  {prescription.medications?.length ? (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {prescription.medications.slice(0, 2).join(", ")}
                      {prescription.medications.length > 2
                        ? ` +${prescription.medications.length - 2}`
                        : ""}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPrescription && (
        <div
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPrescription(null)}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PrescriptionDisplay
              prescription={selectedPrescription}
              onClose={() => setSelectedPrescription(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default CareHistorySection;
