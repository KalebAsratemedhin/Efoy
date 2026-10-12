import { FaCalendarAlt, FaClock, FaUser, FaUserMd, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import CountDown from "./CountDown";
import { formatTime } from "../../utils/timeUtils";

interface ReminderProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: any;
  userRole?: "doctor" | "patient";
  className?: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  finished: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-700",
};

const Reminder = ({
  dashboardData,
  isLoading,
  error,
  userRole = "doctor",
  className = "",
}: ReminderProps) => {
  const upcomingAppointment =
    dashboardData?.upcoming_booking || dashboardData?.upcoming_appointment;
  const eventDate = upcomingAppointment ? findNext(upcomingAppointment) : undefined;
  const isPatient = userRole === "patient";

  if (isLoading) {
    return (
      <div
        className={`bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-12 bg-accent/10" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden ${className}`}
      >
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-semibold text-ink">Upcoming appointment</h2>
        </div>
        <div className="p-5 text-center text-sm text-red-600">
          Couldn’t load appointment data.
        </div>
      </div>
    );
  }

  const status = upcomingAppointment?.status ?? "pending";
  const statusClass = statusStyles[status] ?? "bg-slate-100 text-slate-700";

  return (
    <div
      className={`bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col ${className}`}
    >
      <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-accent/10 to-transparent">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <FaCalendarAlt className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold text-ink">Upcoming appointment</h2>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {eventDate && upcomingAppointment ? (
          <>
            <div className="mb-5">
              <CountDown eventDate={eventDate} />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                {isPatient ? (
                  <FaUserMd className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                ) : (
                  <FaUser className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{isPatient ? "Doctor" : "Patient"}</p>
                  {isPatient && upcomingAppointment.doctorId?.id ? (
                    <Link
                      to={`/doctors/${upcomingAppointment.doctorId.id}`}
                      className="font-medium text-ink truncate hover:text-accent transition-colors block"
                    >
                      {upcomingAppointment.doctorId?.fullName || "Unknown doctor"}
                    </Link>
                  ) : (
                    <p className="font-medium text-ink truncate">
                      {isPatient
                        ? upcomingAppointment.doctorId?.fullName || "Unknown doctor"
                        : upcomingAppointment.patientId?.fullName || "Unknown patient"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                <FaClock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">When</p>
                  <p className="font-medium text-ink">
                    {new Date(upcomingAppointment.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {formatTime(upcomingAppointment.time)}
                  </p>
                </div>
              </div>

              {upcomingAppointment.reason && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-ink text-sm leading-relaxed line-clamp-3">
                    {upcomingAppointment.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-5 space-y-3">
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}
              >
                {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
              </span>
              {upcomingAppointment.id && (
                <Link
                  to={`/appointments/${upcomingAppointment.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover"
                >
                  <FaEye className="w-3.5 h-3.5" />
                  View details
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <FaCalendarAlt className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-1">No upcoming appointments</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-[16rem]">
              {isPatient
                ? "Book a doctor when you’re ready for your next visit."
                : "New appointments will show up here."}
            </p>
            <Link
              to={isPatient ? "/doctors" : "/appointments"}
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              {isPatient ? "Find a doctor" : "View appointments"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminder;

const findNext = (data: any) => {
  const date = new Date(data?.appointmentDate?.split("T")[0] + " " + data.time);
  return date > new Date() ? date : undefined;
};
