import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";
import { RootState } from "../redux/store";
import NotFound from "../components/utils/NotFound";
import PatientDashboard from "../components/dashboard/PatientDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

const DashboardPage = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const role = authState.role;
  const knownRole = role === "patient" || role === "doctor" || role === "admin";

  useEffect(() => {
    if (authState.id && !knownRole) {
      toast.error("This dashboard isn’t available for your account.", {
        id: "dashboard-role",
      });
    }
  }, [authState.id, knownRole]);

  if (!authState.id) return <NotFound />;

  if (!knownRole) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <p className="text-ink font-medium">Dashboard unavailable</p>
        <p className="text-slate-500 text-sm mt-1">Your account role doesn’t have a dashboard.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {role === "patient" && <PatientDashboard />}
      {role === "doctor" && <DoctorDashboard />}
      {role === "admin" && <AdminDashboard />}
    </div>
  );
};

export default DashboardPage;
