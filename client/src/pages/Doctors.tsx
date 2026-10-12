import { useSelector } from "react-redux";
import DoctorsList from "../components/doctors/DoctorsList";
import { authSelector } from "../redux/slices/authSlice";

const Doctors = () => {
  const auth = useSelector(authSelector);
  const isPublicShell = !auth.id;

  return (
    <div
      className={`max-w-7xl mx-auto ${
        isPublicShell ? "px-4 sm:px-6 lg:px-8 py-6 sm:py-8" : ""
      }`}
    >
      <DoctorsList />
    </div>
  );
};

export default Doctors;
