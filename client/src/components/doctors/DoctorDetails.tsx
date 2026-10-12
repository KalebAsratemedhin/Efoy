import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetDoctorByIdQuery } from "../../redux/api/doctorAPI";
import { PageLoader } from "../utils/Spinner";
import DoctorProfile from "./DoctorProfile";
import { Doctor } from "../../types/User";
import { authSelector } from "../../redux/slices/authSlice";
import { useErrorToast } from "../../hooks/useErrorToast";

const DoctorDetails = () => {
  const { id } = useParams();
  const auth = useSelector(authSelector);
  const { isLoading, isError, isSuccess, error, data } = useGetDoctorByIdQuery(id as string);
  const doctor = data;
  const isPublicShell = !auth.id;

  useErrorToast(isError, error, "doctor-details");

  if (isLoading) return <PageLoader label="Loading doctor…" />;

  if (isError) {
    return (
      <div
        className={`max-w-7xl mx-auto text-center py-16 ${
          isPublicShell ? "px-4 sm:px-6 lg:px-8" : ""
        }`}
      >
        <p className="text-ink font-medium">This doctor profile couldn’t be loaded.</p>
        <p className="text-slate-500 text-sm mt-1">Please try again in a moment.</p>
        <Link
          to="/doctors"
          className="inline-flex mt-4 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Back to doctors
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={isPublicShell ? "px-4 sm:px-6 lg:px-8 py-6 sm:py-8" : undefined}>
        <DoctorProfile doctor={doctor as Doctor} />
      </div>
    );
  }
  return null;
};

export default DoctorDetails;
