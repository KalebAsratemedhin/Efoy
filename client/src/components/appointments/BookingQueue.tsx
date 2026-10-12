import { BookingPopulated } from "../../types/Booking";
import BookingCardDoctor from "./BookingCardDoctor";
import { formatTime } from "../../utils/timeUtils";
import { FaStream } from "react-icons/fa";

export function getBookingDateTime(booking: Pick<BookingPopulated, "appointmentDate" | "time">): Date {
  const datePart = booking.appointmentDate?.split("T")[0] ?? "";
  return new Date(`${datePart} ${booking.time}`);
}

/** Keeps API order; keeps only appointments at/after now. */
export function buildQueueBookings(bookings: BookingPopulated[], now = new Date()): BookingPopulated[] {
  const nowMs = now.getTime();
  return bookings.filter((booking) => {
    const when = getBookingDateTime(booking).getTime();
    return !Number.isNaN(when) && when >= nowMs;
  });
}

const BookingQueue = ({
  bookings,
  refetch,
  emptyHint,
  startIndex = 0,
}: {
  bookings: BookingPopulated[];
  refetch: () => void;
  emptyHint?: string;
  /** 0-based offset for queue position labels across pages */
  startIndex?: number;
}) => {
  if (bookings.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl bg-white py-12 px-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FaStream className="w-4 h-4" />
        </div>
        <p className="text-slate-600 text-sm">
          {emptyHint ?? "No upcoming appointments in the queue."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-ink tabular-nums">{bookings.length}</span>
          {" "}on this page
        </p>
        <p className="text-xs text-slate-500">
          Next up ·{" "}
          {new Date(bookings[0].appointmentDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          · {formatTime(bookings[0].time)}
        </p>
      </div>

      <ol className="flex flex-col gap-5">
        {bookings.map((booking, index) => (
          <li key={booking.id} className="flex gap-3 sm:gap-4 items-start">
            <span
              className={`mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                startIndex + index === 0
                  ? "bg-accent text-white"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
              aria-label={`Queue position ${startIndex + index + 1}`}
            >
              {startIndex + index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <BookingCardDoctor booking={booking} refetch={refetch} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default BookingQueue;
