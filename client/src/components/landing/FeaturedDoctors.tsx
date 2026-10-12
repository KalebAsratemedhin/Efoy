import { Link } from "react-router-dom";
import { useGetDoctorsQuery } from "../../redux/api/doctorAPI";
import DoctorCard from "../doctors/DoctorCard";
import { Skeleton } from "../utils/Spinner";
import { useErrorToast } from "../../hooks/useErrorToast";

const TOP_DOCTORS_LIMIT = 3;

const DoctorCardSkeleton = () => (
  <div
    className="flex h-full gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm"
    aria-hidden="true"
  >
    <Skeleton className="w-20 h-20 rounded-full shrink-0" />
    <div className="min-w-0 flex-1 flex flex-col space-y-2.5 py-0.5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/5" />
      <div className="mt-auto pt-3 flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

const FeaturedDoctors = () => {
  const { data, isLoading, isError, error } = useGetDoctorsQuery({
    page: 1,
    limit: TOP_DOCTORS_LIMIT,
    sort: "rating_desc",
  });

  useErrorToast(isError, error, "featured-doctors");

  const doctors = data?.items ?? [];

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        role="status"
        aria-live="polite"
        aria-label="Loading top doctors"
      >
        {Array.from({ length: TOP_DOCTORS_LIMIT }).map((_, i) => (
          <DoctorCardSkeleton key={i} />
        ))}
        <span className="sr-only">Loading top doctors…</span>
      </div>
    );
  }

  if (isError || doctors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
        <p className="text-ink font-medium">
          {isError ? "Doctors couldn’t be loaded right now" : "No doctors available yet"}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {isError ? "Please try again in a moment." : "Check back soon for featured specialists."}
        </p>
        {isError && (
          <Link
            to="/doctors"
            className="inline-flex mt-4 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Try the doctors page
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
      <div className="text-center">
        <Link
          to="/doctors"
          className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          View all doctors
        </Link>
      </div>
    </div>
  );
};

export default FeaturedDoctors;
