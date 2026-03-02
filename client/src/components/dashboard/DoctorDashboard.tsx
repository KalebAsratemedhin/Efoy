import Reminder from "./Reminder";
import MonthlyReport from "./MonthlyReport";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useGetDoctorDashboardQuery } from "../../redux/api/dashboardAPI";
import { useGetDoctorPrescriptionsQuery } from "../../redux/api/prescriptionAPI";
import { Link } from "react-router-dom";

import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { FaPills } from "react-icons/fa";

const DoctorDashboard = () => {
  const { isLoading: isUserLoading, isError: isUserError, error: userError, data: user } = useGetCurrentUserQuery();
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetDoctorDashboardQuery();
  const { data: prescriptionsData } = useGetDoctorPrescriptionsQuery({ page: 1, limit: 5 });

  if (isUserLoading || isDashboardLoading) return <Spinner />;
  if (isUserError) return <Error error={userError} />;
  if (dashboardError) return <Error error={dashboardError} />;

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-slate-600 text-sm">Welcome back, Dr. {user?.fullName}</p>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total appointments</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.total_appointments || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
            All
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-amber-50/60 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-800 font-medium">Pending</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.pending_appointments || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
            ·
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50/60 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800 font-medium">Today</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.today_appointments || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            {new Date().getDate()}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/60 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-sky-800 font-medium">Completion rate</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.completion_rate || 0}%
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
            ✓
          </span>
        </div>
      </div>

      {/* Report (most space) + Upcoming appointment (minimal width) side by side */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 items-start">
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl py-8 px-8">
          <MonthlyReport 
            dashboardData={dashboardData}
            isLoading={isDashboardLoading}
            error={dashboardError}
          />
        </div>
        <div className="lg:w-auto shrink-0">
          <Reminder 
            dashboardData={dashboardData}
            isLoading={isDashboardLoading}
            error={dashboardError}
            userRole="doctor"
          />
        </div>
      </div>

      {/* Cards below - full width */}
      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-ink">Recent Prescriptions</h2>
            <Link to="/prescriptions" className="text-slate-600 hover:text-ink text-sm font-medium">View all</Link>
          </div>
          {prescriptionsData?.items && prescriptionsData.items.length > 0 ? (
            <div className="space-y-3 max-w-3xl">
              {prescriptionsData.items.slice(0, 3).map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <FaPills className="text-slate-600 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {prescription.patientId?.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(prescription.issueDate || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                    prescription.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {prescription.status || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">No prescriptions created yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
