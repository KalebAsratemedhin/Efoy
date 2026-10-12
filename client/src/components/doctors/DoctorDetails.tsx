import { useGetDoctorByIdQuery } from '../../redux/api/doctorAPI';
import { useParams } from 'react-router-dom';
import { PageLoader } from "../utils/Spinner";
import Error from "../utils/Error";
import DoctorProfile from './DoctorProfile';
import { Doctor } from '../../types/User';

const DoctorDetails = () => {
  const { id } = useParams();
  const { isLoading, isError, isSuccess, error, data } = useGetDoctorByIdQuery(id as string);
  const doctor = data;

  if (isLoading) return <PageLoader label="Loading doctor…" />;
  if (isError) return <Error error={error} />;

  if (isSuccess) return <DoctorProfile doctor={doctor as Doctor} />;
  return null;
};

export default DoctorDetails;
