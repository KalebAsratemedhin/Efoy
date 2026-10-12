import { useAdminStatsQuery, useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { PageLoader } from "../utils/Spinner";
import { Link } from "react-router-dom";
import { FaUserMd, FaPlusCircle, FaUsers, FaCog, FaChevronRight } from "react-icons/fa";
import AdminStats from "./AdminStats";
import DashboardHeader from "./DashboardHeader";
import { useErrorToast } from "../../hooks/useErrorToast";

const AdminDashboard = () => {
  const { data: user } = useGetCurrentUserQuery();
  const { isLoading, isError, isSuccess, error, data } = useAdminStatsQuery();
  useErrorToast(isError, error, "admin-dashboard");

  if (isLoading) return <PageLoader label="Loading dashboard…" />;

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.fullName ?? "Admin"}. Manage doctors and oversee the platform.`}
      />

      <section className="mb-6">
        {isError || !isSuccess ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-10 px-6 text-center">
            <p className="text-ink font-medium">Stats couldn’t be loaded</p>
            <p className="text-slate-500 text-sm mt-1">Please try again shortly.</p>
          </div>
        ) : (
          <AdminStats
            doctorsCount={data?.doctorsCount ?? 0}
            patientsCount={data?.patientsCount ?? 0}
            appointmentsCount={data?.appointmentsCount ?? 0}
          />
        )}
      </section>

      <section className="mb-6">
        <Link
          to="/admin/doctors/create"
          className="flex items-center gap-4 py-4 px-5 rounded-xl border border-slate-200 bg-white hover:border-accent/40 hover:bg-accent/5 transition-colors group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <FaUserMd className="text-accent text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-ink block">Add new doctor</span>
            <p className="text-slate-500 text-sm mt-0.5">
              Register a doctor account with login credentials.
            </p>
          </div>
          <FaPlusCircle className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors shrink-0" />
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/doctors"
          className="flex items-center gap-3 py-4 px-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-accent/40 hover:bg-accent/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <FaUsers className="text-slate-600 group-hover:text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink">Doctors</h3>
            <p className="text-slate-500 text-sm mt-0.5">Directory and profiles</p>
          </div>
          <FaChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-accent shrink-0" />
        </Link>

        <Link
          to="/admin/doctors/create"
          className="flex items-center gap-3 py-4 px-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-accent/40 hover:bg-accent/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <FaUserMd className="text-slate-600 group-hover:text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink">Create doctor</h3>
            <p className="text-slate-500 text-sm mt-0.5">Add a new account</p>
          </div>
          <FaChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-accent shrink-0" />
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-3 py-4 px-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-accent/40 hover:bg-accent/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <FaCog className="text-slate-600 group-hover:text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink">Settings</h3>
            <p className="text-slate-500 text-sm mt-0.5">Account preferences</p>
          </div>
          <FaChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-accent shrink-0" />
        </Link>
      </section>
    </div>
  );
};

export default AdminDashboard;
