import { Link } from "react-router-dom";
import { BookingPopulated } from "../../types/Booking";
import { useMarkBookingFinishedMutation } from "../../redux/api/bookingAPI";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { FaUser, FaCalendarAlt, FaClock, FaEye, FaVideo, FaVideoSlash, FaCreditCard, FaCheckCircle, FaPills } from "react-icons/fa";
import { useState } from "react";
import PrescriptionForm from "./PrescriptionForm";
import { formatTime } from "../../utils/timeUtils";

const BookingCardDoctor = ({ booking, refetch }: { booking: BookingPopulated; refetch: () => void }) => {
  const patient = booking.patientId;
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const initials = patient?.fullName?.split(" ").map((n: string) => n[0].toUpperCase()).join("") ?? "?";
  const avatarUrl =
    patient?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.fullName ?? "")}&background=e2e8f0&color=475569&size=128`;

  const [markFinished, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useMarkBookingFinishedMutation();

  const handleStatus = async () => {
    if (booking.id) await markFinished(booking.id);
  };

  if (isUpdateLoading) return <Spinner />;
  if (isUpdateError) return <Error error={updateError} />;
  if (isUpdateSuccess) refetch();

  if (showPrescriptionForm) {
    return (
      <PrescriptionForm
        bookingId={booking.id || ""}
        patientName={booking.patientId?.fullName ?? "Patient"}
        onSuccess={() => setShowPrescriptionForm(false)}
        onCancel={() => setShowPrescriptionForm(false)}
      />
    );
  }

  const statusStyles: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    serviced: "bg-slate-100 text-slate-800",
    finished: "bg-green-100 text-green-800",
  };
  const statusStyle = statusStyles[booking.status ?? ""] ?? "bg-amber-100 text-amber-800";

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
      <div className="flex gap-4">
        <img
          src={avatarUrl}
          alt={patient?.fullName ?? ""}
          className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-slate-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-ink">{patient?.fullName}</h3>
              <p className="text-slate-500 text-sm">{patient?.email}</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
              {(booking.status ?? "").charAt(0).toUpperCase() + (booking.status ?? "").slice(1)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="w-3.5 h-3.5 text-slate-400" />
              {new Date(booking.appointmentDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <FaClock className="w-3.5 h-3.5 text-slate-400" />
              {formatTime(booking.time)}
            </span>
            <span className="flex items-center gap-1.5">
              {booking.appointmentType === "virtual" ? <FaVideo className="w-3.5 h-3.5 text-slate-400" /> : <FaVideoSlash className="w-3.5 h-3.5 text-slate-400" />}
              {booking.appointmentType === "virtual" ? "Video" : "In-person"}
            </span>
            <span className="flex items-center gap-1.5">
              <FaCreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span className={booking.paymentStatus === "paid" ? "text-green-600" : "text-slate-600"}>
                {booking.paymentStatus ? (booking.paymentStatus as string).charAt(0).toUpperCase() + (booking.paymentStatus as string).slice(1) : "Unpaid"}
              </span>
            </span>
          </div>

          {booking.reason && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{booking.reason}</p>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <Link
              to={`/appointments/${booking.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover"
            >
              <FaEye className="w-3.5 h-3.5" />
              View details
            </Link>
            {booking.appointmentType === "virtual" && (
              <Link
                to={`/video-call/${booking.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-ink rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                <FaVideo className="w-3.5 h-3.5" />
                Join call
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowPrescriptionForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-ink rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              <FaPills className="w-3.5 h-3.5" />
              Create prescription
            </button>
            {booking.status === "pending" && (
              <button
                type="button"
                onClick={handleStatus}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <FaCheckCircle className="w-3.5 h-3.5" />
                Mark finished
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCardDoctor;
