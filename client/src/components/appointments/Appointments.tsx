import { useEffect } from "react";
import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaTimes, FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { BookingPopulated } from "../../types/Booking";
import { formatTime } from "../../utils/timeUtils";

const Appointments = () => {
  const navigate = useNavigate();
  const authState = useSelector(authSelector);
  const { data, isLoading, error } = useFindCurrentUserBookingsQuery({ page: 1, limit: 10 });
  const bookings = data?.items;

  useEffect(() => {
    if (!authState.id) {
      navigate("/signin");
    }
  }, [authState.id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">Error loading appointments. Please try again later.</p>
      </div>
    );
  }



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "rejected":
        return <FaTimes className="text-red-500" />;
      case "pending":
        return <FaClock className="text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">View and manage your upcoming appointments</p>
      </motion.div>

      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <p className="text-gray-600 text-lg">No appointments found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: BookingPopulated) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.doctorId.profilePic || `https://ui-avatars.com/api/?name=${booking.doctorId.fullName}&background=0D8ABC&color=fff`}
                      alt={booking.doctorId.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.doctorId.fullName}</h3>
                      <p className="text-cyan-600">{booking.doctorData.speciality}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(booking.status || "pending")}`}>
                    {getStatusIcon(booking.status || "pending")}
                    <span className="font-medium capitalize">{booking.status || "pending"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendarAlt className="text-cyan-500" />
                    <span>{new Date(booking.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaClock className="text-cyan-500" />
                    <span>{formatTime(booking.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1) : 'Unpaid'}
                    </span>
                    {booking.paymentAmount && (
                      <span className="text-xs text-gray-600">
                        {booking.paymentAmount} {booking.paymentCurrency || 'ETB'}
                      </span>
                    )}
                  </div>
                </div>

                {booking.reason && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      <span className="font-medium">Reason for Visit:</span> {booking.reason}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments; 