import { Link, useNavigate } from "react-router-dom";
import { BookingPopulated } from "../../types/Booking";
import { useMarkBookingFinishedMutation } from "../../redux/api/bookingAPI";
import { InlineSpinner } from "../utils/Spinner";
import { FaCalendarAlt, FaClock, FaVideo, FaVideoSlash, FaCreditCard, FaCheckCircle, FaPills } from "react-icons/fa";
import { useEffect, useState } from "react";
import PrescriptionForm from "./PrescriptionForm";
import { formatTime } from "../../utils/timeUtils";
import { toast } from "sonner";
import { extractErrorMessage } from "../../utils/errorHandler";

const BookingCardDoctor = ({ booking, refetch }: { booking: BookingPopulated; refetch: () => void }) => {
  const navigate = useNavigate();
  const patient = booking.patientId;
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const avatarUrl =
    patient?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.fullName ?? "")}&background=e2e8f0&color=475569&size=128`;

  const [markFinished, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useMarkBookingFinishedMutation();

  const handleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.id) await markFinished(booking.id);
  };

  useEffect(() => {
    if (isUpdateSuccess) {
      toast.success("Appointment marked as finished");
      refetch();
    }
  }, [isUpdateSuccess, refetch]);

  useEffect(() => {
    if (isUpdateError) toast.error(extractErrorMessage(updateError));
  }, [isUpdateError, updateError]);

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-sky-100 text-sky-800",
    finished: "bg-green-100 text-green-800",
    cancelled: "bg-slate-100 text-slate-700",
  };
  const statusStyle = statusStyles[booking.status ?? ""] ?? "bg-slate-100 text-slate-700";
  const canMarkFinished =
    booking.status === "pending" || booking.status === "confirmed";

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate(`/appointments/${booking.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/appointments/${booking.id}`);
          }
        }}
        className="h-full p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors cursor-pointer"
      >
        <div className="flex gap-4">
          <img
            src={avatarUrl}
            alt={patient?.fullName ?? ""}
            className="w-14 h-14 rounded-full object-contain bg-slate-50 shrink-0 ring-2 ring-slate-100 p-0.5"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ink text-base">{patient?.fullName}</h3>
                <p className="text-slate-500 text-sm mt-0.5 truncate">{patient?.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusStyle}`}>
                {(booking.status ?? "").charAt(0).toUpperCase() + (booking.status ?? "").slice(1)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {new Date(booking.appointmentDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {formatTime(booking.time)}
              </span>
              <span className="flex items-center gap-1.5">
                {booking.appointmentType === "virtual" ? <FaVideo className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <FaVideoSlash className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {booking.appointmentType === "virtual" ? "Video" : "In-person"}
              </span>
              <span className="flex items-center gap-1.5">
                <FaCreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={booking.paymentStatus === "paid" ? "text-green-600" : "text-slate-600"}>
                  {booking.paymentStatus ? (booking.paymentStatus as string).charAt(0).toUpperCase() + (booking.paymentStatus as string).slice(1) : "Unpaid"}
                </span>
              </span>
            </div>

            {booking.reason && (
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{booking.reason}</p>
            )}

            <div
              className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {booking.appointmentType === "virtual" && (
                <Link
                  to={`/video-call/${booking.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-ink rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  <FaVideo className="w-3.5 h-3.5" />
                  Join call
                </Link>
              )}
              <button
                type="button"
                onClick={() => setShowPrescriptionForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-ink rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                <FaPills className="w-3.5 h-3.5" />
                Prescription
              </button>
              {canMarkFinished && (
                <button
                  type="button"
                  onClick={handleStatus}
                  disabled={isUpdateLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                >
                  {isUpdateLoading ? <InlineSpinner className="text-white" /> : <FaCheckCircle className="w-3.5 h-3.5" />}
                  Mark finished
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPrescriptionForm && (
        <div
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPrescriptionForm(false)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PrescriptionForm
              bookingId={booking.id || ""}
              patientName={booking.patientId?.fullName ?? "Patient"}
              onSuccess={() => setShowPrescriptionForm(false)}
              onCancel={() => setShowPrescriptionForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCardDoctor;
