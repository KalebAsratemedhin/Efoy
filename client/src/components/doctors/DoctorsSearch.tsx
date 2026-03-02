import { useGetDoctorsQuery } from "../../redux/api/doctorAPI"
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import DoctorCard from "./DoctorCard";
import { Doctor } from "../../types/User";

interface DoctorsSearchProps {
    searchTerm: string;
}

const DoctorsSearch = ({ searchTerm }: DoctorsSearchProps) => {
    const { isLoading, isSuccess, isError, error, data } = useGetDoctorsQuery({ search: searchTerm || '' });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
            </div>
        );
    }
    
    if (isError) {
        return <Error error={error} />;
    }

    if (isSuccess && data) {
        // Extract doctors array from the API response
        const responseData = data as any; // API returns { doctors: Doctor[], totalPages: number, currentPage: number }
        const doctors = responseData?.doctors || [];
        
        return (
            <>
                <p className="text-slate-600 text-sm mb-4">
                    Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} for &quot;{searchTerm}&quot;
                </p>

                {doctors.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-8 mt-4 text-center">
                        <p className="text-slate-600">No doctors found for &quot;{searchTerm}&quot;. Try a different search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {doctors.map((doctor: Doctor) => (
                            <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                    </div>
                )}
            </>
        );
    }

    return null;
};

export default DoctorsSearch;