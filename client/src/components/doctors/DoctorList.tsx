import { useState } from "react";
import { useGetDoctorsQuery } from "../../redux/api/doctorAPI";
import DoctorCard from "./DoctorCard";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { Doctor } from "../../types/User";

const DoctorList = () => {
  const { data: doctors, isLoading, error } = useGetDoctorsQuery({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("");

  // Fix: Get specialities from the correct property path
  const specialities = doctors ? [...new Set(doctors.map((doctor: Doctor) => doctor.speciality))] as string[] : [];

  const filteredDoctors = doctors?.filter((doctor: Doctor) => {
    // Fix: Access properties correctly based on Doctor interface
    const doctorName = doctor.userId?.fullName || "";
    const doctorSpeciality = doctor.speciality || "";
    
    const matchesSearch = doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorSpeciality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeciality = !selectedSpeciality || doctorSpeciality === selectedSpeciality;
    return matchesSearch && matchesSpeciality;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">Error loading doctors. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Doctors</h1>
        <p className="text-gray-600">Find and book appointments with our experienced medical professionals</p>
      </motion.div>

      <div className="mb-8 space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search doctors by name or speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <select
          value={selectedSpeciality}
          onChange={(e) => setSelectedSpeciality(e.target.value)}
          className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="">All Specialities</option>
          {specialities.map((speciality) => (
            <option key={speciality} value={speciality}>
              {speciality}
            </option>
          ))}
        </select>
      </div>

      {filteredDoctors?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No doctors found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors?.map((doctor: Doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList; 