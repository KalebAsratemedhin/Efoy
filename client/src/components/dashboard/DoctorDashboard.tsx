import { useState } from "react";
import Reminder from "./Reminder";
import MonthlyReport from "./MonthlyReport";
import DashboardHeader from "./DashboardHeader";
import StatTile from "./StatTile";
import SectionCard from "./SectionCard";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useGetDoctorDashboardQuery } from "../../redux/api/dashboardAPI";
import { useGetDoctorPrescriptionsQuery } from "../../redux/api/prescriptionAPI";
import { PageLoader } from "../utils/Spinner";
import Error from "../utils/Error";
import {
  FaPills,
  FaCalendarCheck,
  FaHourglassHalf,
  FaCalendarDay,
  FaChartLine,
} from "react-icons/fa";
import { Prescription } from "../../types/Prescription";
import PrescriptionDisplay from "../appointments/PrescriptionDisplay";

const DoctorDashboard = () => {
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    data: user,
  } = useGetCurrentUserQuery();
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useGetDoctorDashboardQuery();
  const { data: prescriptionsData } = useGetDoctorPrescriptionsQuery({ page: 1, limit: 5 });
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  if (isUserLoading || isDashboardLoading) return <PageLoader label="Loading dashboard…" />;
  if (isUserError) return <Error error={userError} />;
  if (dashboardError) return <Error error={dashboardError} />;

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader
        title={`Welcome back, Dr. ${user?.fullName ?? ""}`}
        subtitle="Today’s schedule, patients, and prescriptions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Total appointments"
          value={dashboardData?.stats?.total_appointments || 0}
          icon={<FaCalendarCheck className="w-4 h-4" />}
          tint="slate"
        />
        <StatTile
          label="Pending"
          value={dashboardData?.stats?.pending_appointments || 0}
          icon={<FaHourglassHalf className="w-4 h-4" />}
          tint="amber"
        />
        <StatTile
          label="Today"
          value={dashboardData?.stats?.today_appointments || 0}
          icon={<FaCalendarDay className="w-4 h-4" />}
          tint="emerald"
        />
        <StatTile
          label="Completion rate"
          value={`${dashboardData?.stats?.completion_rate || 0}%`}
          icon={<FaChartLine className="w-4 h-4" />}
          tint="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6 items-stretch">
        <div className="min-h-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
          <MonthlyReport
            dashboardData={dashboardData}
            isLoading={isDashboardLoading}
            error={dashboardError}
          />
        </div>
        <Reminder
          dashboardData={dashboardData}
          isLoading={isDashboardLoading}
          error={dashboardError}
          userRole="doctor"
          className="h-full min-h-[20rem]"
        />
      </div>

      <SectionCard title="Recent prescriptions" viewAllTo="/prescriptions">
        {prescriptionsData?.items && prescriptionsData.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prescriptionsData.items.slice(0, 4).map((prescription) => (
              <button
                key={prescription.id}
                type="button"
                onClick={() => setSelectedPrescription(prescription)}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 text-left hover:border-accent/40 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <FaPills className="text-slate-600 text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink text-sm truncate">
                      {prescription.patientId?.fullName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {new Date(prescription.issueDate || "").toLocaleDateString()}
                      {prescription.diagnosis ? ` · ${prescription.diagnosis}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                    prescription.status === "active"
                      ? "bg-green-100 text-green-800"
                      : prescription.status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {prescription.status || "N/A"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-slate-500 text-sm">No prescriptions created yet</p>
        )}
      </SectionCard>

      {selectedPrescription && (
        <div
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPrescription(null)}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PrescriptionDisplay
              prescription={selectedPrescription}
              onClose={() => setSelectedPrescription(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
