import { useFindOneBookingQuery, useMarkBookingFinishedMutation, useUpdateBookingMutation } from "../../redux/api/bookingAPI";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../utils/Spinner";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import Error from "../utils/Error";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import TimeDate from "./TimeDate";
import { FaArrowLeft } from "react-icons/fa";
import { formatTime } from "../../utils/timeUtils";
import { useFindCurrentUserRatingQuery } from "../../redux/api/ratingAPI";
import RatingStars from "../rating/RatingStars";

interface FormData {
  appointmentDate: string;
  time: string;
  reason: string;
}

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, isSuccess, isError, error, data } = useFindOneBookingQuery(id as string);
  const [updateBooking, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateBookingMutation();
  const [
    markFinished,
    { isLoading: isFinishLoading, isSuccess: isFinishSuccess, isError: isFinishError, error: finishError },
  ] = useMarkBookingFinishedMutation();
  const authState = useSelector(authSelector);
  const doctor = data?.doctorId as { fullName?: string; profilePic?: string; speciality?: string; experience?: number } | undefined;
  const patient = data?.patientId;
  const appointment = data;

  const doctorIdForRating = (doctor as any)?.id as string | undefined;
  const { data: existingRating } = useFindCurrentUserRatingQuery(doctorIdForRating ?? "", {
    skip: authState.role !== "patient" || appointment?.status !== "finished" || !doctorIdForRating,
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({});

  useEffect(() => {
    if (appointment) {
      reset({
        appointmentDate: appointment.appointmentDate.split("T")[0],
        reason: appointment.reason,
        time: appointment.time,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: FormData) => {
    await updateBooking({ id: id as string, update: formData }).unwrap();
  };

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;
  if (!isSuccess || !data) return null;

  const canDoctorFinish =
    authState.role === "doctor" &&
    appointment?.status !== "finished" &&
    appointment?.status !== "rejected";

  return (
    <div className="max-w-4xl text-left">
      <button
        onClick={() => navigate("/appointments")}
        className="flex items-center gap-2 text-slate-600 hover:text-ink text-sm mb-4"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to Appointments
      </button>
      <h1 className="text-xl font-bold text-ink">Appointment Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-left">
            <h2 className="text-sm font-semibold text-ink mb-3">
              {authState.role === "patient" ? "Doctor" : "Patient"}
            </h2>
            {authState.role === "patient" ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium overflow-hidden shrink-0">
                    {doctor?.profilePic ? (
                      <img src={doctor.profilePic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      doctor?.fullName?.split(" ").map((n) => n[0]).join("")
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{doctor?.fullName}</p>
                    <p className="text-xs text-slate-500">{doctor?.speciality ?? "—"}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Experience: {doctor?.experience ?? "—"} years</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium overflow-hidden shrink-0">
                    {patient?.profilePic ? (
                      <img src={patient.profilePic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      patient?.fullName?.split(" ").map((n) => n[0]).join("")
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{patient?.fullName}</p>
                    <p className="text-xs text-slate-500">Patient</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{patient?.email}</p>
                  <p>{patient?.phoneNumber || "—"}</p>
                  {patient?.age != null && <p>Age: {patient.age}</p>}
                </div>
              </>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-left">
            <h2 className="text-sm font-semibold text-ink mb-3">Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Status</span>
                <span
                  className={`inline-flex w-fit px-2 py-0.5 rounded text-xs font-medium ${
                    appointment?.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : appointment?.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : "Pending"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Date</span>
                <span className="text-ink">
                  {appointment?.appointmentDate
                    ? new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Time</span>
                <span className="text-ink">{appointment?.time ? formatTime(appointment.time) : "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Payment</span>
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex w-fit px-2 py-0.5 rounded text-xs font-medium ${
                      appointment?.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : appointment?.paymentStatus === "refunded"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {appointment?.paymentStatus ? appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1) : "Unpaid"}
                  </span>
                  {appointment?.paymentAmount && (
                    <span className="text-ink text-sm">
                      {appointment.paymentAmount} {appointment.paymentCurrency || "ETB"}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {authState.role === "doctor" && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {isFinishError && finishError && <FormError error={finishError} />}
                {isFinishSuccess && <FormSuccess message="Appointment marked as finished." />}

                {canDoctorFinish ? (
                  <button
                    type="button"
                    disabled={isFinishLoading}
                    onClick={async () => {
                      if (!id) return;
                      await markFinished(id).unwrap();
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFinishLoading ? "Updating…" : "Mark finished"}
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">
                    This appointment can’t be marked finished.
                  </p>
                )}
              </div>
            )}

            {authState.role === "patient" && appointment?.status === "finished" && doctorIdForRating && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {!existingRating ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-slate-600">Rate doctor:</span>
                    <RatingStars doctorId={doctorIdForRating} />
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    You rated <span className="font-medium text-ink">{existingRating.value}/5</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {authState.role === "patient" ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-left">
              <h2 className="text-sm font-semibold text-ink mb-3">Edit Appointment</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reason
                  </label>
                  <textarea
                    id="reason"
                    {...register("reason", { required: "Reason is required" })}
                    className={`w-full px-3 py-2.5 border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
                      errors.reason ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="Reason for appointment"
                    rows={3}
                  />
                  {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
                </div>

                <TimeDate
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  doctorId={data?.doctorId?.id}
                  currentTime={data?.time}
                />

                {isUpdateError && <FormError error={error} />}
                {isUpdateLoading && <Spinner />}
                {isUpdateSuccess && <FormSuccess message="Appointment updated." />}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-left">
              <h2 className="text-sm font-semibold text-ink mb-3">Appointment info</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Reason</p>
                  <p className="text-ink whitespace-pre-wrap">{appointment?.reason || "—"}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 mb-1">Date</p>
                    <p className="text-ink">
                      {appointment?.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Time</p>
                    <p className="text-ink">{appointment?.time ? formatTime(appointment.time) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Type</p>
                    <p className="text-ink capitalize">{appointment?.appointmentType?.replace("_", " ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Payment</p>
                    <p className="text-ink capitalize">{appointment?.paymentStatus || "—"}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Doctors can only update the appointment status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
