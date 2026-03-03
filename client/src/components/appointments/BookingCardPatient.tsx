import { Link } from "react-router-dom";
import { useDeleteBookingMutation } from "../../redux/api/bookingAPI";
import { useFindCurrentUserRatingQuery } from "../../redux/api/ratingAPI";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { BookingPopulated } from "../../types/Booking";
import { FaCalendarAlt, FaClock, FaTrash, FaEye, FaVideo, FaVideoSlash, FaCreditCard } from "react-icons/fa";
import RatingStars from "../rating/RatingStars";
import { useEffect } from "react";
import { formatTime } from "../../utils/timeUtils";

const BookingCardPatient = ({ booking, refetch }: { booking: BookingPopulated; refetch: () => void }) => {
  const doctor = booking.doctorId;
  const avatarUrl =
    doctor?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.fullName ?? "")}&background=e2e8f0&color=475569&size=128`;

  const [deleteBooking, { isLoading, isError, isSuccess, error }] = useDeleteBookingMutation();
  const { data: existingRating } = useFindCurrentUserRatingQuery(doctor?.id ?? "", {
    skip: booking.status !== "finished",
  });

  const handleDelete = async () => {
    await deleteBooking(booking.id as string);
  };

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  const statusStyles: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    serviced: "bg-slate-100 text-slate-800",
    finished: "bg-green-100 text-green-800",
  };
  const statusStyle = statusStyles[booking.status ?? ""] ?? "bg-amber-100 text-amber-800";

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;

  return (
    <div className="p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
      <div className="flex gap-3">
        <img
          src={avatarUrl}
          alt={doctor?.fullName ?? ""}
          className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-slate-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-1.5">
            <div>
              <h3 className="font-semibold text-ink text-sm">Dr. {doctor?.fullName}</h3>
              <p className="text-slate-500 text-xs">{booking.doctorData?.speciality} · {booking.doctorData?.experience} yrs</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusStyle}`}>
              {(booking.status ?? "").charAt(0).toUpperCase() + (booking.status ?? "").slice(1)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="w-3 h-3 text-slate-400 shrink-0" />
              {new Date(booking.appointmentDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="w-3 h-3 text-slate-400 shrink-0" />
              {formatTime(booking.time)}
            </span>
            <span className="flex items-center gap-1">
              {booking.appointmentType === "virtual" ? <FaVideo className="w-3 h-3 text-slate-400 shrink-0" /> : <FaVideoSlash className="w-3 h-3 text-slate-400 shrink-0" />}
              {booking.appointmentType === "virtual" ? "Video" : "In-person"}
            </span>
            <span className="flex items-center gap-1">
              <FaCreditCard className="w-3 h-3 text-slate-400 shrink-0" />
              <span className={booking.paymentStatus === "paid" ? "text-green-600" : booking.paymentStatus === "unpaid" ? "text-amber-600" : "text-slate-600"}>
                {booking.paymentStatus ? (booking.paymentStatus as string).charAt(0).toUpperCase() + (booking.paymentStatus as string).slice(1) : "Unpaid"}
              </span>
            </span>
          </div>

          {booking.reason && (
            <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{booking.reason}</p>
          )}

          {booking.paymentStatus === "unpaid" && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-amber-800">Payment — ${booking.paymentAmount ?? 150}</span>
              <Link
                to={`/payment/${booking.id}`}
                className="text-xs font-medium text-amber-800 hover:text-amber-900 underline"
              >
                Pay now
              </Link>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <Link
              to={`/appointments/${booking.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover"
            >
              <FaEye className="w-3 h-3" />
              Details
            </Link>
            {booking.paymentStatus === "unpaid" && (
              <Link
                to={`/payment/${booking.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-amber-300 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-50"
              >
                <FaCreditCard className="w-3 h-3" />
                Pay
              </Link>
            )}
            {booking.appointmentType === "virtual" && (
              <Link
                to={`/video-call/${booking.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-ink rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                <FaVideo className="w-3 h-3" />
                Join call
              </Link>
            )}
            {booking.status !== "finished" && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50"
              >
                <FaTrash className="w-3 h-3" />
                Cancel
              </button>
            )}
          </div>

          {booking.status === "finished" && !existingRating && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-600">Rate:</span>
              <RatingStars doctorId={doctor?.id ?? ""} />
            </div>
          )}
          {booking.status === "finished" && existingRating && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Rated {existingRating.value}/5
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCardPatient;
