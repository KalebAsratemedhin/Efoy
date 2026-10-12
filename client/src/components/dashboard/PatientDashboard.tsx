import { Link } from "react-router-dom"
import Reminder from "./Reminder"
import MonthlyReport from "./MonthlyReport"
import FavoritesList from "./FavoritesList"

import { FaPills, FaCreditCard } from "react-icons/fa";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useGetPatientDashboardQuery } from "../../redux/api/dashboardAPI";
import { useFindCurrentUserFavoritesQuery } from "../../redux/api/ratingAPI";
import { useGetPatientPrescriptionsQuery } from "../../redux/api/prescriptionAPI";
import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import { PageLoader } from "../utils/Spinner";
import Error from "../utils/Error";
import { formatTime } from "../../utils/timeUtils";

const PatientDashboard = () => {
  const { isLoading: isUserLoading, isError: isUserError, error: userError, data: user } = useGetCurrentUserQuery();
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetPatientDashboardQuery();
  const { data: favoritesData } = useFindCurrentUserFavoritesQuery();
  const { data: prescriptionsData } = useGetPatientPrescriptionsQuery({ page: 1, limit: 5 });
  const { data: bookingsData } = useFindCurrentUserBookingsQuery({ page: 1, limit: 10 });

  if (isUserLoading || isDashboardLoading) return <PageLoader label="Loading dashboard…" />;
  if (isUserError) return <Error error={userError} />;
  if (dashboardError) return <Error error={dashboardError} />;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-ink">Welcome back, {user?.fullName}</h1>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total bookings</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.total_bookings || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
            All
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800 font-medium">Upcoming</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.upcoming_bookings || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            ●
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-sky-800 font-medium">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {dashboardData?.stats?.completed_bookings || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
            ✓
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-800 font-medium">Favorites</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {favoritesData?.length || 0}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
            ❤
          </span>
        </div>
      </div>

      {/* Report + Upcoming appointment side by side, equal height via grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-6 items-stretch">
        <div className="min-h-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm py-6 px-6">
          <div className="flex-1 min-h-0 flex flex-col">
            <MonthlyReport 
              dashboardData={dashboardData}
              isLoading={isDashboardLoading}
              error={dashboardError}
            />
          </div>
        </div>
        <div className="min-h-0">
          <Reminder 
            dashboardData={dashboardData}
            isLoading={isDashboardLoading}
            error={dashboardError}
            userRole="patient"
            className="h-full"
          />
        </div>
      </div>

      {/* Unpaid + Prescriptions side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-ink">Unpaid Appointments</h2>
            <Link to="/appointments" className="text-slate-600 hover:text-ink text-sm font-medium">
              View all
            </Link>
          </div>
          {bookingsData?.items && bookingsData.items.filter(booking => booking.paymentStatus === 'unpaid').length > 0 ? (
            <div className="space-y-3">
              {bookingsData.items
                .filter(booking => booking.paymentStatus === 'unpaid')
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <FaCreditCard className="text-amber-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-ink text-sm">
                          Dr. {booking.doctorId?.fullName}
                        </p>
                        <p className="text-xs text-slate-600">
                          {new Date(booking.appointmentDate || '').toLocaleDateString()} at {formatTime(booking.time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-800">${booking.paymentAmount || 150.00}</span>
                      <Link 
                        to={`/payment/${booking.id}`}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                      >
                        Pay now
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">No unpaid appointments</div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-ink">Recent Prescriptions</h2>
            <Link to="/prescriptions" className="text-slate-600 hover:text-ink text-sm font-medium">View all</Link>
          </div>
          {prescriptionsData?.items && prescriptionsData.items.length > 0 ? (
            <div className="space-y-3">
              {prescriptionsData.items.slice(0, 3).map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <FaPills className="text-slate-600 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-ink text-sm">
                        Dr. {prescription.doctorId?.fullName}
                      </p>
                      <p className="text-xs text-slate-600">
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
            <div className="text-center py-6 text-slate-500 text-sm">No prescriptions yet</div>
          )}
        </div>
      </div>

      {/* Favorite doctors - not a card, at bottom */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-ink">Favorite Doctors</h2>
          <Link to="/doctors" className="text-slate-600 hover:text-ink text-sm font-medium">View all</Link>
        </div>
        <div className="max-w-3xl">
          <FavoritesList />
        </div>
      </section>
    </div>
  )
}

export default PatientDashboard;