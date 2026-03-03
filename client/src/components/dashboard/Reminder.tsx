import { FaCalendarAlt, FaUserMd, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import CountDown from './CountDown';

import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface ReminderProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: any;
  userRole?: 'doctor' | 'patient';
  className?: string;
}

const Reminder = ({ dashboardData, isLoading, error, userRole = 'doctor', className = '' }: ReminderProps) => {
  const { isDarkMode } = useTheme();
  
  // Get the upcoming appointment from dashboard data
  const upcomingAppointment = dashboardData?.upcoming_booking || dashboardData?.upcoming_appointment;
  const eventDate = upcomingAppointment ? findNext(upcomingAppointment) : undefined;
  
  const textColor = '#000000' ;
  const secondaryTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    console.log('dashboardData', dashboardData);
  }, [dashboardData]);


  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`bg-slate-50 border border-slate-200 shadow-sm rounded-xl overflow-hidden sticky top-6 p-0 hover:shadow-md transition-shadow duration-300 ${className || 'self-start'}`}
      >
        <div className="animate-pulse">
          <div className="bg-slate-700 p-6">
            <div className="flex items-center gap-3 text-white">
              <FaCalendarAlt className="h-6 w-6" />
              <h2 className="text-xl font-bold">Upcoming Appointment</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`bg-slate-50 border border-slate-200 shadow-sm rounded-xl overflow-hidden sticky top-6 p-0 hover:shadow-md transition-shadow duration-300 ${className || 'self-start'}`}
      >
        <div className="bg-slate-700 p-6">
          <div className="flex items-center gap-3 text-white">
            <FaCalendarAlt className="h-6 w-6" />
            <h2 className="text-xl font-bold">Upcoming Appointment</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading appointment data</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5 }}
    className={`bg-slate-50 border border-slate-200 shadow-sm rounded-xl overflow-hidden sticky top-6 p-0 hover:shadow-md transition-shadow duration-300 ${className || 'self-start'}`}
  >
    <div >
      {/* Header */}
      <div className="bg-slate-700 text-white py-4 px-6 rounded-t-xl">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Upcoming Appointment</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {eventDate && upcomingAppointment ? (
          <>
            {/* Countdown Timer */}
            <div className="mb-6">
              <CountDown eventDate={eventDate} />
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaUserMd className="h-5 w-5 text-slate-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{userRole === 'doctor' ? 'Patient' : 'Doctor'}</p>
                  <p className="font-medium" style={{ color: textColor }}>
                    {userRole === 'doctor' 
                      ? (upcomingAppointment.patientId?.fullName || 'Unknown Patient')
                      : (upcomingAppointment.doctorId?.fullName || 'Unknown Doctor')
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="h-5 w-5 text-slate-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium" style={{ color: textColor }}>
                    {new Date(eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="h-5 w-5 text-slate-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium" style={{ color: textColor }}>
                    {new Date(upcomingAppointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {upcomingAppointment.reason && (
                <div className="flex items-start gap-3">
                  <FaUserMd className="h-5 w-5 text-slate-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="font-medium" style={{ color: textColor }}>
                      {upcomingAppointment.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {upcomingAppointment.status?.charAt(0).toUpperCase() + upcomingAppointment.status?.slice(1) || 'Approved'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FaCalendarAlt className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: textColor }}>No Upcoming Appointments</h3>
            <p className="text-sm text-center" style={{ color: secondaryTextColor }}>
              You don't have any scheduled appointments at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
    </motion.div>
  );
};

export default Reminder;

const findNext = (data: any) => {
  const now = new Date();
  const date = new Date(data?.appointmentDate?.split('T')[0] + ' ' + data.time);
  return date > now ? date : undefined;
};