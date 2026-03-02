import React, { useState } from 'react';
import { FaPills, FaDownload, FaEye, FaCalendar, FaUserMd, FaUser } from 'react-icons/fa';
import { useGetPatientPrescriptionsQuery, useGetDoctorPrescriptionsQuery } from '../../redux/api/prescriptionAPI';
import { Prescription } from '../../types/Prescription';
import PrescriptionDisplay from './PrescriptionDisplay';
import Spinner from '../utils/Spinner';
import Pagination from '../utils/Pagination';
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/slices/authSlice';

const PrescriptionList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  const user = useSelector(authSelector);
  const isDoctor = user.role === 'doctor';

  const { data: patientPrescriptionsData, isLoading: isPatientLoading, isError: isPatientError } = useGetPatientPrescriptionsQuery({
    page: currentPage,
    limit: 10
  }, { skip: isDoctor });

  const { data: doctorPrescriptionsData, isLoading: isDoctorLoading, isError: isDoctorError } = useGetDoctorPrescriptionsQuery({
    page: currentPage,
    limit: 10
  }, { skip: !isDoctor });

  const prescriptionsData = isDoctor ? doctorPrescriptionsData : patientPrescriptionsData;
  const isLoading = isDoctor ? isDoctorLoading : isPatientLoading;
  const isError = isDoctor ? isDoctorError : isPatientError;


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleCloseModal = () => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-red-600">Failed to load prescriptions. Please try again.</div>
      </div>
    );
  }

  if (!prescriptionsData?.items || prescriptionsData.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-slate-600 text-sm mb-4">{isDoctor ? 'Manage prescriptions you create for patients.' : 'View your medical prescriptions.'}</p>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-600">
          {isDoctor ? "You haven't created any prescriptions yet." : "You don't have any prescriptions yet."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-slate-600 text-sm mb-4">{isDoctor ? 'Manage prescriptions for your patients.' : 'View your medical prescriptions.'}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prescriptionsData.items.map((prescription) => (
          <div
            key={prescription.id}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaPills className="text-accent" />
                <span className="font-medium text-ink">#{prescription.id?.slice(-8)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                prescription.status === 'expired' ? 'bg-red-100 text-red-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                {prescription.status || 'N/A'}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {isDoctor ? <FaUser className="text-slate-400" /> : <FaUserMd className="text-slate-400" />}
                <span className="text-slate-500">{isDoctor ? 'Patient' : 'Doctor'}</span>
                <span className="text-ink font-medium">
                  {isDoctor ? prescription.patientId?.fullName : `Dr. ${prescription.doctorId?.fullName}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FaCalendar className="text-slate-400" />
                {prescription.issueDate ? formatDate(prescription.issueDate) : 'N/A'}
              </div>
              {prescription.medications?.length ? (
                <p className="text-xs text-slate-500 truncate">{prescription.medications.slice(0, 2).join(', ')}{(prescription.medications?.length || 0) > 2 ? '…' : ''}</p>
              ) : null}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleViewPrescription(prescription)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm font-medium"
                >
                  <FaEye className="text-xs" />
                  View
                </button>
                <button
                  onClick={() => handleViewPrescription(prescription)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                  title="Download PDF"
                >
                  <FaDownload className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {prescriptionsData.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={prescriptionsData.total_pages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <PrescriptionDisplay
              prescription={selectedPrescription}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList; 