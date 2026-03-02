import { useFindCurrentUserBookingsQuery } from "../../redux/api/bookingAPI";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import BookingCardPatient from "./BookingCardPatient";
import { authSelector } from "../../redux/slices/authSlice";
import { useSelector } from "react-redux";
import BookingCardDoctor from "./BookingCardDoctor";
import Pagination from "../utils/Pagination";
import { useState } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { BookingPopulated } from "../../types/Booking";

const BookingList = () => {
  const authState = useSelector(authSelector);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 3;
  const { isSuccess, isError, isLoading, error, data, refetch } = useFindCurrentUserBookingsQuery({
    page: currentPage,
    limit,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;

  if (isSuccess) {
    const { items: rawBookings, total_pages: totalPages } = data;
    const bookings = Array.isArray(rawBookings) ? rawBookings : [];
    const filteredBookings = bookings.filter((booking: BookingPopulated) => {
      const matchesSearch =
        authState.role === "patient"
          ? booking.doctorId.fullName.toLowerCase().includes(searchTerm.toLowerCase())
          : booking.patientId?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search by ${authState.role === "patient" ? "doctor" : "patient"} name...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div className="sm:w-48 relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="border border-slate-200 rounded-lg bg-white py-12 text-center">
            <p className="text-slate-600 text-sm">
              {searchTerm || statusFilter !== "all"
                ? "No appointments match your filters."
                : "You don't have any appointments yet."}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl space-y-4">
            {filteredBookings.map((booking: BookingPopulated) =>
              authState.role === "patient" ? (
                <BookingCardPatient key={booking.id} booking={booking} refetch={refetch} />
              ) : (
                <BookingCardDoctor key={booking.id} booking={booking} refetch={refetch} />
              )
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default BookingList;
