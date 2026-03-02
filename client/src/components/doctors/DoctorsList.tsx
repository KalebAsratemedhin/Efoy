import { useGetDoctorsQuery } from "../../redux/api/doctorAPI"
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import DoctorCard from "./DoctorCard";
import Pagination from "../utils/Pagination";
import { useState } from "react";
import { Doctor } from "../../types/User";

interface DoctorsListProps {
    embedded?: boolean; // when true, used inside landing (no wrapper/header)
}

const DoctorsList = ({ embedded = false }: DoctorsListProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 3; // 3x3 grid

    const { isLoading, isSuccess, isError, error, data } = useGetDoctorsQuery({
        page: currentPage,
        limit,
    });

    if (isLoading) return <Spinner />;

    if (isError) {
        console.log("error", error);
        return <Error error={error} />;
    }

    if (isSuccess) {
        const responseData = data as any;
        const doctors = responseData?.doctors || [];
        const totalPages = responseData?.totalPages || 1;
        const apiCurrentPage = responseData?.currentPage || 1;

        const content = (
            <>
                {!embedded && (
                    <p className="text-slate-600 text-2xl font-bold mb-12">Find and book with our medical professionals.</p>
                )}
                <div className={embedded ? "" : "mt-4"}>
                    {doctors.length === 0 ? (
                        <div className={
                            embedded
                                ? "bg-elevated/80 rounded-2xl border border-white/5 p-12 text-center"
                                : "bg-white border border-slate-200 rounded-lg p-8 text-center"
                        }>
                            <h3 className={`text-lg font-semibold ${embedded ? "text-white" : "text-ink"}`}>No doctors found</h3>
                            <p className={embedded ? "text-slate-400 mt-1" : "text-slate-500 text-sm mt-1"}>No doctors are available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {doctors.map((doctor: Doctor) => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={apiCurrentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
            </>
        );

        if (embedded) {
            return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>;
        }

        return <>{content}</>;
    }

    return null;
};

export default DoctorsList;