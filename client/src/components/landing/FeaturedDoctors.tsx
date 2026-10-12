import { Link } from "react-router-dom";
import { useGetDoctorsQuery } from "../../redux/api/doctorAPI";
import DoctorCard from "../doctors/DoctorCard";
import Error from "../utils/Error";
import { Skeleton } from "../utils/Spinner";

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

  if (isError) return <Error error={error} />;

  if (doctors.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-ink font-medium">No doctors available yet</p>
        <p className="text-slate-500 text-sm mt-1">Check back soon for featured specialists.</p>
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
