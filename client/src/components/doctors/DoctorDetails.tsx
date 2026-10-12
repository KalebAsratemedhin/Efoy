import { useGetDoctorByIdQuery } from '../../redux/api/doctorAPI';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageLoader } from "../utils/Spinner";
import Error from "../utils/Error";
import DoctorProfile from './DoctorProfile';
import { Doctor } from '../../types/User';
import { authSelector } from '../../redux/slices/authSlice';

const DoctorDetails = () => {
  const { id } = useParams();
  const auth = useSelector(authSelector);
  const { isLoading, isError, isSuccess, error, data } = useGetDoctorByIdQuery(id as string);
  const doctor = data;
  const isPublicShell = !auth.id;

  if (isLoading) return <PageLoader label="Loading doctor…" />;
  if (isError) return <Error error={error} />;

  if (isSuccess) {
    return (
      <div className={isPublicShell ? "px-4 sm:px-6 lg:px-8 py-6 sm:py-8" : undefined}>
        <DoctorProfile doctor={doctor as Doctor} />
      </div>
    );
  }
  return null;
};

export default DoctorDetails;
