import { Doctor } from "../../types/User"
import RatingDisplay from "../rating/RatingDisplay";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import CommentList from "../comment/CommentList";
import CommentBox from "../comment/CommentBox";
import RatingStars from "../rating/RatingStars";
import { motion } from "framer-motion";
import { FaUserMd, FaGraduationCap, FaPhone, FaEnvelope, FaStar, FaBriefcase } from "react-icons/fa";

const DoctorProfile = ({doctor} : {doctor: Doctor}) => {
  const initials = doctor.userId.fullName.split(' ').map((name) => name[0].toUpperCase()).join('');  
  const authState = useSelector(authSelector);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative mb-6">
            {doctor.userId?.profilePic ? (
              <img 
                src={doctor.userId.profilePic} 
                alt={doctor.userId.fullName} 
                className="w-40 h-40 rounded-full object-cover border-4 border-purple-100"
              />
            ) : (
              <div className="w-40 h-40 rounded-full flex justify-center items-center bg-purple-100 text-4xl font-semibold text-purple-600 border-4 border-purple-200">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              {doctor.speciality}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{doctor.userId.fullName}</h2>
          <p className="text-purple-600 font-medium mb-4">{doctor.speciality}</p>
          
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <FaBriefcase className="text-purple-500" />
            <span>{doctor.experience} years experience</span>
          </div>

          <div className="w-full space-y-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FaEnvelope className="text-purple-500" />
              <span className="text-sm">{doctor.userId.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaPhone className="text-purple-500" />
              <span className="text-sm">{doctor.userId.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaGraduationCap className="text-purple-500" />
              <span className="text-sm">{doctor.educationLevel}</span>
            </div>
          </div>

          <div className="mt-6 w-full">
            {authState.id !== doctor?.id ? (
              <RatingStars doctorId={doctor?.id as string} />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaStar className="text-yellow-400 text-xl" />
                <RatingDisplay value={doctor.rating as number} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaUserMd className="text-purple-600" />
              Patient Reviews
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto">
                <CommentList doctorId={doctor.id as string} />
              </div>
              {authState.id !== doctor.id && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <CommentBox doctorId={doctor.id as string} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DoctorProfile;

