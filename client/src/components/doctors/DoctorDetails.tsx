import { useGetDoctorByIdQuery } from '../../redux/api/doctorAPI';
import { useParams } from 'react-router-dom';
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import DoctorProfile from './DoctorProfile';
import { Doctor } from '../../types/User';

const DoctorDetails = () => {
  const { id } = useParams();
  const { isLoading, isError, isSuccess, error, data } = useGetDoctorByIdQuery(id as string);
  const doctor = data;

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;

  if (isSuccess)
    return (
      <div className='p-6'>
        <DoctorProfile doctor={doctor as Doctor} />
      </div>
    );
};

export default DoctorDetails;
