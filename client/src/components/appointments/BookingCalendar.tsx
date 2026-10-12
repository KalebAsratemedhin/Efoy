import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { FaCalendarAlt, FaClock, FaTimes, FaUser, FaUserMd, FaEye } from "react-icons/fa";
import { authSelector } from "../../redux/slices/authSlice";
import { BookingPopulated } from "../../types/Booking";
import { formatTime } from "../../utils/timeUtils";

const STATUS_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  pending: { bg: "#f59e0b", border: "#d97706", badge: "bg-amber-100 text-amber-800" },
  confirmed: { bg: "#0ea5e9", border: "#0284c7", badge: "bg-sky-100 text-sky-800" },
  finished: { bg: "#10b981", border: "#059669", badge: "bg-green-100 text-green-800" },
  cancelled: { bg: "#94a3b8", border: "#64748b", badge: "bg-slate-100 text-slate-700" },
};

interface BookingCalendarProps {
  bookings: BookingPopulated[];
  emptyHint?: string;
}

const BookingCalendar = ({ bookings, emptyHint }: BookingCalendarProps) => {
  const authState = useSelector(authSelector);
  const isPatient = authState.role === "patient";
  const [selected, setSelected] = useState<BookingPopulated | null>(null);

  const events = useMemo(
    () =>
      bookings.map((booking) => {
        const datePart = booking.appointmentDate?.split("T")[0] ?? "";
        const start = new Date(`${datePart} ${booking.time}`);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        const colors = STATUS_COLORS[booking.status ?? ""] ?? STATUS_COLORS.pending;
        return {
          id: booking.id,
          title: isPatient
            ? `Dr. ${booking.doctorId?.fullName || "Unknown"}`
            : booking.patientId?.fullName || "Patient",
          start,
          end,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: "#fff",
          extendedProps: { booking },
        };
      }),
    [bookings, isPatient]
  );

  const onEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    setSelected(info.event.extendedProps.booking as BookingPopulated);
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm">
        <div className="inline-flex p-4 rounded-2xl bg-slate-50 mb-4">
          <FaCalendarAlt className="text-slate-400 w-7 h-7" />
        </div>
        <p className="text-ink font-medium">No appointments on the calendar</p>
        <p className="text-slate-500 text-sm mt-1">
          {emptyHint ?? "Scheduled appointments will show up here."}
        </p>
      </div>
    );
  }

  const statusStyle =
    STATUS_COLORS[selected?.status ?? ""]?.badge ?? "bg-slate-100 text-slate-700";

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 pt-4 sm:pt-5">
          {(
            [
              ["pending", "Pending"],
              ["confirmed", "Confirmed"],
              ["finished", "Finished"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([key, label]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[key].bg }}
              />
              {label}
            </span>
          ))}
        </div>

        <div className="p-3 sm:p-5 booking-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            height="auto"
            events={events}
            eventClick={onEventClick}
            eventDisplay="block"
            dayMaxEvents={3}
            nowIndicator
            selectable={false}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              list: "Agenda",
            }}
          />
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-slate-200 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Appointment
                </p>
                <h2 className="text-lg font-semibold text-ink mt-0.5">
                  {isPatient
                    ? `Dr. ${selected.doctorId?.fullName || "Unknown"}`
                    : selected.patientId?.fullName || "Patient"}
                </h2>
              </div>
              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle}`}
                >
                  {(selected.status ?? "pending").charAt(0).toUpperCase() +
                    (selected.status ?? "pending").slice(1)}
                </span>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                  {selected.appointmentType?.replace("_", " ") || "In person"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                  <FaCalendarAlt className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-ink font-medium">
                      {new Date(selected.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                  <FaClock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-ink font-medium">{formatTime(selected.time)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                  {isPatient ? (
                    <FaUserMd className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  ) : (
                    <FaUser className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-slate-500">{isPatient ? "Doctor" : "Patient"}</p>
                    {isPatient && selected.doctorId?.id ? (
                      <Link
                        to={`/doctors/${selected.doctorId.id}`}
                        className="text-ink font-medium hover:text-accent transition-colors"
                      >
                        Dr. {selected.doctorId?.fullName || "Unknown"}
                      </Link>
                    ) : (
                      <p className="text-ink font-medium">
                        {isPatient
                          ? `Dr. ${selected.doctorId?.fullName || "Unknown"}`
                          : selected.patientId?.fullName || "Patient"}
                      </p>
                    )}
                    {isPatient && selected.doctorData?.speciality && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {selected.doctorData.speciality}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selected.reason && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-sm text-ink leading-relaxed">{selected.reason}</p>
                </div>
              )}

              <Link
                to={`/appointments/${selected.id}`}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover"
              >
                <FaEye className="w-3.5 h-3.5" />
                View details
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCalendar;
