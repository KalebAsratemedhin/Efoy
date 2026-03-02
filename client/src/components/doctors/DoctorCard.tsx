import { Link } from "react-router-dom";
import { Doctor } from "../../types/User";
import { FaStar } from "react-icons/fa";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  if (!doctor?.userId) {
    return (
      <div className="flex flex-col bg-stone-50/80 border border-slate-200 rounded-xl overflow-hidden animate-pulse">
        <div className="w-full h-40 bg-slate-200" />
        <div className="p-5 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const name = doctor.userId.fullName ?? "Doctor";
  const avatarUrl =
    doctor.userId.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&size=400`;
  const rating = doctor.rating != null ? Number(doctor.rating).toFixed(1) : "—";
  const price = doctor.sessionPrice != null ? doctor.sessionPrice : 0;

  return (
    <Link
      to={`/book/${doctor.userId.id}`}
      className="group flex flex-col items-start bg-stone-50/80 border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 hover:border-slate-300 hover:shadow-md"
    >
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-40 object-cover"
      />
      <div className="p-5 w-full bg-white">
        <h3 className="text-lg font-semibold text-ink truncate group-hover:text-accent transition-colors">
          Dr. {name}
        </h3>
        <p className="text-slate-600 text-sm truncate mt-0.5">{doctor.speciality}</p>
        <p className="text-slate-500 text-sm mt-2">
          {doctor.educationLevel} · {doctor.experience} yrs
          <span className="inline-flex items-center gap-0.5 ml-2">
            <FaStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        </p>
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3 group-hover:border-slate-300 transition-colors">
          <span className="text-base font-semibold text-ink">${price}</span>
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium group-hover:bg-accent-hover transition-colors">
            Book
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DoctorCard;
