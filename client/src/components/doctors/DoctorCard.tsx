import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Doctor } from "../../types/User";
import { FaBan, FaStar } from "react-icons/fa";
import { authSelector } from "../../redux/slices/authSlice";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const auth = useSelector(authSelector);
  const canBook = auth.role !== "doctor" && auth.role !== "admin";

  if (!doctor?.userId) {
    return (
      <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse">
        <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  const name = doctor.userId.fullName ?? "Doctor";
  const avatarUrl =
    doctor.userId.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&size=200`;
  const rating = doctor.rating != null ? Number(doctor.rating).toFixed(1) : "—";
  const price = doctor.sessionPrice != null ? doctor.sessionPrice : 0;
  const profileHref = `/doctors/${doctor.userId.id}`;
  const bookHref = `/book/${doctor.userId.id}`;
  const isRestricted = Boolean(doctor.userId.isRestricted);
  const showRestrictedBadge = auth.role === "admin" && isRestricted;

  return (
    <div className="group flex h-full gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <Link to={profileHref} className="shrink-0">
        <img
          src={avatarUrl}
          alt={name}
          className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-accent/30 transition-shadow"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="min-w-0 flex-1 flex flex-col">
        <Link to={profileHref} className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-lg font-semibold text-ink truncate group-hover:text-accent transition-colors">
              Dr. {name}
            </h3>
            {showRestrictedBadge && (
              <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">
                <FaBan className="w-2.5 h-2.5" />
                Restricted
              </span>
            )}
          </div>
        </Link>
        <p className="text-slate-600 text-sm truncate mt-0.5">{doctor.speciality}</p>
        <p className="text-slate-500 text-sm mt-1.5">
          {doctor.educationLevel} · {doctor.experience} yrs
          <span className="inline-flex items-center gap-0.5 ml-2">
            <FaStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-ink">${price}</span>
          {canBook && !isRestricted ? (
            <Link
              to={bookHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Book
            </Link>
          ) : (
            <Link
              to={profileHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 text-ink text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
