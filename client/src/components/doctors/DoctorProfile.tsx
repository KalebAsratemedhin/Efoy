import { Link } from "react-router-dom";
import { Doctor } from "../../types/User";
import RatingDisplay from "../rating/RatingDisplay";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import CommentList from "../comment/CommentList";
import CommentBox from "../comment/CommentBox";
import RatingStars from "../rating/RatingStars";
import BackButton from "../utils/BackButton";
import { FaGraduationCap, FaBriefcase, FaStar, FaDollarSign } from "react-icons/fa";
import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import { useMemo } from "react";

const DoctorProfile = ({ doctor }: { doctor: Doctor }) => {
  const auth = useSelector(authSelector);
  const doctorUserId = doctor.userId?.id;
  const name = doctor.userId?.fullName ?? "Doctor";
  const initials = name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const canBook = auth.role === "patient";
  const isOwnProfile = auth.id === doctorUserId;

  const { data: bookingsData, isLoading: bookingsLoading } = useFindCurrentUserBookingsQuery(
    { page: 1, limit: 100, status: "finished" },
    { skip: auth.role !== "patient" || !doctorUserId }
  );

  const canReview = useMemo(() => {
    if (auth.role !== "patient" || !doctorUserId) return false;
    const items = bookingsData?.items ?? [];
    return items.some(
      (b) => b.status === "finished" && b.doctorId?.id === doctorUserId
    );
  }, [auth.role, bookingsData?.items, doctorUserId]);

  const ratingValue = doctor.rating != null ? Number(doctor.rating) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <BackButton to="/doctors" label="Back to Doctors" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile summary */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200" />
            <div className="px-6 pb-6 -mt-16">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bg-slate-50 shadow-md mx-auto sm:mx-0">
                {doctor.userId?.profilePic ? (
                  <img
                    src={doctor.userId.profilePic}
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10 text-2xl font-semibold text-accent">
                    {initials}
                  </div>
                )}
              </div>

              <div className="mt-4 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-ink">Dr. {name}</h1>
                <p className="text-accent font-medium mt-1">{doctor.speciality}</p>
              </div>

              <div className="mt-5 flex items-center justify-center sm:justify-start gap-2">
                <RatingDisplay value={ratingValue} />
                <span className="text-sm text-slate-600 font-medium">
                  {ratingValue > 0 ? ratingValue.toFixed(1) : "No ratings yet"}
                </span>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-3 text-slate-600">
                  <FaBriefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="text-ink font-medium">{doctor.experience} years</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <FaGraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-slate-500">Education</dt>
                    <dd className="text-ink font-medium">{doctor.educationLevel}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <FaDollarSign className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-slate-500">Session</dt>
                    <dd className="text-ink font-medium">${doctor.sessionPrice ?? 0}</dd>
                  </div>
                </div>
              </dl>

              {canBook && !isOwnProfile && doctorUserId && (
                <Link
                  to={`/book/${doctorUserId}`}
                  className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                >
                  Book appointment
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Reviews */}
        <section className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <FaStar className="text-amber-400" />
              <h2 className="text-lg font-semibold text-ink">Patient reviews</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Feedback from patients who completed an appointment with this doctor.
            </p>

            {doctorUserId && <CommentList doctorId={doctorUserId} />}
          </div>

          {!isOwnProfile && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-ink mb-1">Leave a review</h2>

              {auth.role !== "patient" ? (
                <p className="text-sm text-slate-600 mt-2">
                  Only patients can rate and review doctors.
                </p>
              ) : bookingsLoading ? (
                <p className="text-sm text-slate-500 mt-2">Checking your appointments…</p>
              ) : canReview && doctorUserId ? (
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Your rating</p>
                    <RatingStars doctorId={doctorUserId} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Your comment</p>
                    <CommentBox doctorId={doctorUserId} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 mt-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  Only patients with a <span className="font-medium text-ink">finished</span>{" "}
                  appointment with this doctor can leave a rating or review.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DoctorProfile;
