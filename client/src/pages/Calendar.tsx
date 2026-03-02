import { useFindCurrentUserBookingsQuery } from "../redux/api/bookingAPI";
import { useSelector } from "react-redux";
import { authSelector } from "../redux/slices/authSlice";
import Spinner from "../components/utils/Spinner";
import Error from "../components/utils/Error";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { formatTime } from "../utils/timeUtils";

const CalendarPage = () => {
  const authState = useSelector(authSelector);
  const { data, isLoading, isError, error } = useFindCurrentUserBookingsQuery({ page: 1, limit: 100 });
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;

  const events = (data?.items || []).map((booking: any) => {
    const start = new Date(booking.appointmentDate.split("T")[0] + " " + booking.time);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return {
      id: booking.id,
      title: authState.role === "patient"
        ? `Dr. ${booking.doctorId?.fullName || "Unknown"}`
        : booking.patientId?.fullName || "Patient",
      start,
      end,
      extendedProps: { ...booking },
      backgroundColor: booking.status === "approved" ? "#0d9488" : booking.status === "pending" ? "#d97706" : "#b91c1c",
      borderColor: booking.status === "approved" ? "#0d9488" : booking.status === "pending" ? "#d97706" : "#b91c1c",
    };
  });

  return (
    <div className="max-w-7xl text-left">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink flex items-center gap-2">
          View and manage your appointments
        </h1>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
            <FaCalendarAlt className="text-slate-400 w-8 h-8" />
          </div>
          <p className="text-slate-600 font-medium">No appointments scheduled</p>
          <p className="text-slate-500 text-sm mt-1">Your upcoming appointments will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listWeek",
              }}
              height="auto"
              events={events}
              eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
              eventDisplay="block"
              dayMaxEvents={3}
              selectable={false}
              nowIndicator={true}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                list: "List",
              }}
              windowResize={() => {}}
              className="calendar-slate"
            />
          </div>
        </div>
      )}

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-ink">Appointment Details</h2>
              <button
                type="button"
                className="p-2 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/30"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <span className="text-slate-500 font-medium block mb-0.5">Date</span>
                <p className="text-ink">
                  {new Date(selectedEvent.appointmentDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-0.5">Time</span>
                <p className="text-ink">{formatTime(selectedEvent.time)}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-0.5">
                  {authState.role === "patient" ? "Doctor" : "Patient"}
                </span>
                <p className="text-ink">
                  {authState.role === "patient"
                    ? `Dr. ${selectedEvent.doctorId?.fullName || "Unknown"}`
                    : selectedEvent.patientId?.fullName || "Patient"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-0.5">Status</span>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                    selectedEvent.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : selectedEvent.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedEvent.status ? selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1) : "—"}
                </span>
              </div>
              {selectedEvent.reason && (
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Reason</span>
                  <p className="text-ink">{selectedEvent.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
