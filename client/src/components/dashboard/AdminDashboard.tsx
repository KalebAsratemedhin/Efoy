import { useAdminStatsQuery, useGetCurrentUserQuery } from "../../redux/api/userAPI";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { Link } from "react-router-dom";
import { FaUserMd, FaPlusCircle, FaUsers, FaChartPie, FaUserCog } from "react-icons/fa";

import AdminStats from "./AdminStats";

const AdminDashboard = () => {
  const { data: user } = useGetCurrentUserQuery();
  const { isLoading, isError, isSuccess, error, data } = useAdminStatsQuery();

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;

  if (!isSuccess) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-slate-600 text-sm">
        Welcome back, {user?.fullName}. Manage doctors, view stats, and oversee the platform.
      </p>

      <section className="mt-4 mb-6">
        <AdminStats
          doctorsCount={data?.doctorsCount ?? 0}
          patientsCount={data?.patientsCount ?? 0}
          appointmentsCount={data?.appointmentsCount ?? 0}
        />
      </section>

      <section className="mb-6">
        <Link
          to="/admin/doctors/create"
          className="flex items-center gap-4 py-4 px-5 rounded-xl border border-slate-200 bg-white hover:border-accent/40 hover:bg-accent/5 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <FaUserMd className="text-accent text-xl" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-ink block">Add New Doctor</span>
            <p className="text-slate-500 text-sm mt-0.5">Register a new doctor account with login credentials.</p>
          </div>
          <FaPlusCircle className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="py-4 px-5 border border-slate-100 rounded-xl bg-white hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FaUsers className="text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">Manage Doctors</h3>
              <p className="text-slate-500 text-sm mt-0.5">Applications and profiles</p>
            </div>
          </div>
        </div>
        <div className="py-4 px-5 border border-slate-100 rounded-xl bg-white hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FaChartPie className="text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">System Reports</h3>
              <p className="text-slate-500 text-sm mt-0.5">Analytics and reports</p>
            </div>
          </div>
        </div>
        <div className="py-4 px-5 border border-slate-100 rounded-xl bg-white hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FaUserCog className="text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">User Management</h3>
              <p className="text-slate-500 text-sm mt-0.5">Accounts and permissions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard