import { useState } from "react";
import { Link } from "react-router-dom";
import Reminder from "./Reminder";
import MonthlyReport from "./MonthlyReport";
import FavoritesList from "./FavoritesList";
import DashboardHeader from "./DashboardHeader";
import StatTile from "./StatTile";
import SectionCard from "./SectionCard";
import {
  FaPills,
  FaCreditCard,
  FaCalendarCheck,
  FaCalendarAlt,
  FaCheckCircle,
  FaHeart,
} from "react-icons/fa";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useGetPatientDashboardQuery } from "../../redux/api/dashboardAPI";
import { useFindCurrentUserFavoritesQuery } from "../../redux/api/ratingAPI";
import { useGetPatientPrescriptionsQuery } from "../../redux/api/prescriptionAPI";
import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import { PageLoader } from "../utils/Spinner";
import { formatTime } from "../../utils/timeUtils";
import { Prescription } from "../../types/Prescription";
import PrescriptionDisplay from "../appointments/PrescriptionDisplay";
import { useErrorToast } from "../../hooks/useErrorToast";

const PatientDashboard = () => {
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    data: user,
  } = useGetCurrentUserQuery();
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
  } = useGetPatientDashboardQuery();
  const { data: favoritesData } = useFindCurrentUserFavoritesQuery();
  const { data: prescriptionsData } = useGetPatientPrescriptionsQuery({ page: 1, limit: 5 });
  const { data: bookingsData } = useFindCurrentUserBookingsQuery({ page: 1, limit: 10 });
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useErrorToast(isUserError, userError, "patient-dashboard-user");
  useErrorToast(isDashboardError, dashboardError, "patient-dashboard");

  if (isUserLoading || isDashboardLoading) return <PageLoader label="Loading dashboard…" />;

  const unpaid = (bookingsData?.items ?? []).filter((b) => b.paymentStatus === "unpaid");

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader
        title={`Welcome back, ${user?.fullName ?? ""}`}
        subtitle="Your bookings, payments, and favorite doctors at a glance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Total bookings"
          value={dashboardData?.stats?.total_bookings || 0}
          icon={<FaCalendarCheck className="w-4 h-4" />}
          tint="slate"
        />
        <StatTile
          label="Upcoming"
          value={dashboardData?.stats?.upcoming_bookings || 0}
          icon={<FaCalendarAlt className="w-4 h-4" />}
          tint="emerald"
        />
        <StatTile
          label="Completed"
          value={dashboardData?.stats?.completed_bookings || 0}
          icon={<FaCheckCircle className="w-4 h-4" />}
          tint="sky"
        />
        <StatTile
          label="Favorites"
          value={favoritesData?.length || 0}
          icon={<FaHeart className="w-4 h-4" />}
          tint="amber"
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
          userRole="patient"
          className="h-full min-h-[20rem]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Unpaid appointments" viewAllTo="/appointments">
          {unpaid.length > 0 ? (
            <div className="space-y-2.5">
              {unpaid.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <FaCreditCard className="text-amber-700 text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink text-sm truncate">
                        Dr. {booking.doctorId?.fullName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(booking.appointmentDate || "").toLocaleDateString()} ·{" "}
                        {formatTime(booking.time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-amber-900">
                      {booking.paymentAmount ?? 150} {booking.paymentCurrency || "ETB"}
                    </span>
                    <Link
                      to={`/payment/${booking.id}`}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                    >
                      Pay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-slate-500 text-sm">No unpaid appointments</p>
          )}
        </SectionCard>

        <SectionCard title="Recent prescriptions" viewAllTo="/prescriptions">
          {prescriptionsData?.items && prescriptionsData.items.length > 0 ? (
            <div className="space-y-2.5">
              {prescriptionsData.items.slice(0, 3).map((prescription) => (
                <button
                  key={prescription.id}
                  type="button"
                  onClick={() => setSelectedPrescription(prescription)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 text-left hover:border-accent/40 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <FaPills className="text-slate-600 text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink text-sm truncate">
                        Dr. {prescription.doctorId?.fullName}
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
            <p className="text-center py-6 text-slate-500 text-sm">No prescriptions yet</p>
          )}
        </SectionCard>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-ink">Favorite doctors</h2>
          <Link to="/doctors" className="text-slate-600 hover:text-ink text-sm font-medium">
            View all
          </Link>
        </div>
        <FavoritesList />
      </section>

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

export default PatientDashboard;
