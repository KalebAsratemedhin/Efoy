import { Link } from "react-router-dom";
import { Doctor } from "../../types/User";
import RatingDisplay from "../rating/RatingDisplay";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import CommentList from "../comment/CommentList";
import CommentBox from "../comment/CommentBox";
import RatingStars from "../rating/RatingStars";
import BackButton from "../utils/BackButton";
import DoctorBoardSection from "./DoctorBoardSection";
import DoctorQaSection from "./DoctorQaSection";
import AccountRestrictionPanel from "../admin/AccountRestrictionPanel";
import {
  FaGraduationCap,
  FaBriefcase,
  FaStar,
  FaDollarSign,
  FaClock,
  FaTimes,
  FaPen,
  FaBookOpen,
  FaComments,
  FaBan,
} from "react-icons/fa";
import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import { useMemo, useState } from "react";
import { formatTime } from "../../utils/timeUtils";

type ProfileContentTab = "posts" | "qa";

const WEEK_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const DoctorProfile = ({ doctor }: { doctor: Doctor }) => {
  const auth = useSelector(authSelector);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [contentTab, setContentTab] = useState<ProfileContentTab>("posts");
  const doctorUserId = doctor.userId?.id;
  const name = doctor.userId?.fullName ?? "Doctor";
  const initials = name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const canBook = auth.role === "patient";
  const isOwnProfile = auth.id === doctorUserId;
  const isAdmin = auth.role === "admin";
  const isRestricted = Boolean(doctor.userId?.isRestricted);

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
  const hours = doctor.workingHours ?? {};
  const hasSchedule = WEEK_DAYS.some((d) => hours[d.key]?.start && hours[d.key]?.end);

  return (
    <div className="max-w-7xl mx-auto">
      <BackButton to="/doctors" label="Back to Doctors" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 space-y-5">
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
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-ink">Dr. {name}</h1>
                  {isRestricted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                      <FaBan className="w-2.5 h-2.5" />
                      Restricted
                    </span>
                  )}
                </div>
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
                    <dd className="text-ink font-medium">{doctor.sessionPrice ?? 0} ETB</dd>
                  </div>
                </div>
              </dl>

              {canBook && !isOwnProfile && !isRestricted && doctorUserId && (
                <Link
                  to={`/book/${doctorUserId}`}
                  className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                >
                  Book appointment
                </Link>
              )}
            </div>
          </div>

          {isAdmin && doctorUserId && (
            <AccountRestrictionPanel
              userId={doctorUserId}
              accountLabel="doctor"
              isRestricted={isRestricted}
              restrictedAt={doctor.userId?.restrictedAt}
              restrictionReason={doctor.userId?.restrictionReason}
            />
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="w-4 h-4 text-accent" />
              <h2 className="text-base font-semibold text-ink">Work schedule</h2>
            </div>
            {hasSchedule ? (
              <ul className="space-y-2">
                {WEEK_DAYS.map(({ key, label }) => {
                  const day = hours[key];
                  const open = Boolean(day?.start && day?.end);
                  return (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-slate-600 font-medium">{label}</span>
                      {open ? (
                        <span className="text-ink tabular-nums">
                          {formatTime(day!.start)} – {formatTime(day!.end)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                          Closed
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Schedule not set yet.</p>
            )}
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-amber-400" />
                  <h2 className="text-lg font-semibold text-ink">Patient reviews</h2>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Feedback from patients who completed an appointment with this doctor.
                </p>
              </div>
              {!isOwnProfile && !bookingsLoading && canReview && doctorUserId && (
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover shrink-0"
                >
                  <FaPen className="w-3 h-3" />
                  Leave a review
                </button>
              )}
            </div>

            <div className="mt-5">
              {doctorUserId && <CommentList doctorId={doctorUserId} />}
            </div>
          </div>

          {doctorUserId && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div
                className="flex border-b border-slate-200"
                role="tablist"
                aria-label="Doctor content"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={contentTab === "posts"}
                  id="tab-posts"
                  aria-controls="panel-posts"
                  onClick={() => setContentTab("posts")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    contentTab === "posts"
                      ? "text-accent border-b-2 border-accent bg-accent/5"
                      : "text-slate-500 hover:text-ink hover:bg-slate-50"
                  }`}
                >
                  <FaBookOpen className="w-3.5 h-3.5" />
                  Posts
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={contentTab === "qa"}
                  id="tab-qa"
                  aria-controls="panel-qa"
                  onClick={() => setContentTab("qa")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    contentTab === "qa"
                      ? "text-accent border-b-2 border-accent bg-accent/5"
                      : "text-slate-500 hover:text-ink hover:bg-slate-50"
                  }`}
                >
                  <FaComments className="w-3.5 h-3.5" />
                  Q&A
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {contentTab === "posts" ? (
                  <div
                    role="tabpanel"
                    id="panel-posts"
                    aria-labelledby="tab-posts"
                  >
                    <DoctorBoardSection
                      doctorUserId={doctorUserId}
                      isOwner={isOwnProfile}
                      embedded
                    />
                  </div>
                ) : (
                  <div role="tabpanel" id="panel-qa" aria-labelledby="tab-qa">
                    <DoctorQaSection
                      doctorUserId={doctorUserId}
                      doctorName={name}
                      isOwner={isOwnProfile}
                      isPatient={auth.role === "patient"}
                      currentUserId={auth.id}
                      embedded
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {reviewOpen && doctorUserId && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={() => setReviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-review-title"
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-slate-200 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="leave-review-title" className="text-lg font-semibold text-ink">
                  Leave a review
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Share your experience with Dr. {name}.
                </p>
              </div>
              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100"
                onClick={() => setReviewOpen(false)}
                aria-label="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Your rating</p>
                <RatingStars doctorId={doctorUserId} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Your comment</p>
                <CommentBox doctorId={doctorUserId} onSuccess={() => setReviewOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
