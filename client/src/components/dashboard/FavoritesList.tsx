import { useFindCurrentUserFavoritesQuery } from "../../redux/api/ratingAPI";
import Spinner from "../utils/Spinner";
import DoctorCard from "../doctors/DoctorCard";
import Pagination from "../utils/Pagination";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useErrorToast } from "../../hooks/useErrorToast";

const FavoritesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { isLoading, isError, isSuccess, error, data } = useFindCurrentUserFavoritesQuery();
  useErrorToast(isError, error, "favorites-list");

  if (isLoading) return <Spinner size="sm" className="py-6" />;

  if (isError || (isSuccess && (!data || data.length === 0))) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-full mb-4">
          <FaHeart className="text-slate-400 text-xl" />
        </div>
        <h3 className="text-lg font-semibold text-ink mb-2">
          {isError ? "Favorites couldn’t be loaded" : "No favorites yet"}
        </h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          {isError
            ? "Please try again in a moment."
            : "Doctors you rate after finished appointments appear here."}
        </p>
      </div>
    );
  }

  if (isSuccess) {
    const totalItems = data?.length || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data?.slice(startIndex, endIndex) || [];

    return (
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {paginatedData.map((fav: any, index: number) => (
            <DoctorCard key={fav?.id || index} doctor={fav} />
          ))}
        </div>
        <Pagination
          className="mt-6"
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  }

  return null;
};

export default FavoritesList;
