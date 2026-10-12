import { useFindOneBookingQuery, useMarkBookingFinishedMutation, useUpdateBookingMutation } from "../../redux/api/bookingAPI";
import { Link, useParams } from "react-router-dom";
import { InlineSpinner, PageLoader } from "../utils/Spinner";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import BackButton from "../utils/BackButton";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import TimeDate from "./TimeDate";
import { formatTime } from "../../utils/timeUtils";
import { useFindCurrentUserRatingQuery } from "../../redux/api/ratingAPI";
import RatingStars from "../rating/RatingStars";
import { FaBriefcase, FaGraduationCap, FaDollarSign } from "react-icons/fa";
import CareHistorySection from "./CareHistorySection";
import { useErrorToast } from "../../hooks/useErrorToast";

interface FormData {
  appointmentDate: string;
  time: string;
  reason: string;
}

const statusBadgeClass = (status?: string) => {
  if (status === "finished") return "bg-green-100 text-green-800";
  if (status === "confirmed") return "bg-sky-100 text-sky-800";
  if (status === "cancelled") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-800";
};

const paymentBadgeClass = (status?: string) => {
  if (status === "paid") return "bg-green-100 text-green-800";
  if (status === "refunded") return "bg-slate-100 text-slate-800";
  return "bg-red-100 text-red-800";
};

const formatAppointmentDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BookingDetails = () => {
  const { id } = useParams();
  const { isLoading, isSuccess, isError, error, data } = useFindOneBookingQuery(id as string);
  const [updateBooking, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] =
    useUpdateBookingMutation();
  const [
    markFinished,
    { isLoading: isFinishLoading, isSuccess: isFinishSuccess, isError: isFinishError, error: finishError },
  ] = useMarkBookingFinishedMutation();
  const authState = useSelector(authSelector);
  const doctor = data?.doctorId;
  const doctorData = data?.doctorData;
  const patient = data?.patientId;
  const appointment = data;
  const doctorProfileHref = doctor?.id ? `/doctors/${doctor.id}` : undefined;
  const isPatient = authState.role === "patient";
  const isDoctor = authState.role === "doctor";

  const doctorIdForRating = doctor?.id;
  const { data: existingRating } = useFindCurrentUserRatingQuery(doctorIdForRating ?? "", {
    skip: !isPatient || appointment?.status !== "finished" || !doctorIdForRating,
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

  useErrorToast(isError, error, "booking-details");

  if (isLoading) return <PageLoader label="Loading appointment…" />;
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <BackButton to="/appointments" label="Back to Appointments" className="mb-5 mx-auto" />
        <p className="text-ink font-medium">This appointment couldn’t be loaded.</p>
        <p className="text-slate-500 text-sm mt-1">Please try again in a moment.</p>
      </div>
    );
  }
  if (!isSuccess || !data) return null;

  const canDoctorFinish =
    isDoctor && (appointment?.status === "pending" || appointment?.status === "confirmed");

  return (
    <div className="max-w-7xl mx-auto text-left">
      <BackButton to="/appointments" label="Back to Appointments" className="mb-5" />
      <h1 className="text-2xl font-bold text-ink">Appointment Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 lg:items-stretch">
        <aside className="lg:col-span-1 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left w-full flex flex-col h-full min-h-full">
            <h2 className="text-base font-semibold text-ink mb-4">
              {isPatient ? "Doctor" : "Patient"}
            </h2>
            {isPatient ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {doctorProfileHref ? (
                    <Link to={doctorProfileHref} className="shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium overflow-hidden ring-2 ring-slate-100 hover:ring-accent/30 transition-shadow">
                        {doctor?.profilePic ? (
                          <img
                            src={doctor.profilePic}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          doctor?.fullName?.split(" ").map((n) => n[0]).join("")
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium overflow-hidden shrink-0">
                      {doctor?.profilePic ? (
                        <img
                          src={doctor.profilePic}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        doctor?.fullName?.split(" ").map((n) => n[0]).join("")
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    {doctorProfileHref ? (
                      <Link
                        to={doctorProfileHref}
                        className="font-medium text-ink text-base hover:text-accent transition-colors"
                      >
                        Dr. {doctor?.fullName}
                      </Link>
                    ) : (
                      <p className="font-medium text-ink text-base">Dr. {doctor?.fullName}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-0.5">{doctorData?.speciality || "—"}</p>
                  </div>
                </div>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaBriefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <dt className="sr-only">Experience</dt>
                    <dd>{doctorData?.experience ?? "—"} years experience</dd>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaGraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <dt className="sr-only">Education</dt>
                    <dd>{doctorData?.educationLevel || "—"}</dd>
                  </div>
                  {doctorData?.sessionPrice != null && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaDollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <dt className="sr-only">Session</dt>
                      <dd>{doctorData.sessionPrice} ETB / session</dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium overflow-hidden shrink-0">
                    {patient?.profilePic ? (
                      <img
                        src={patient.profilePic}
                        alt=""
                        className="w-full h-full object-contain p-0.5"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      patient?.fullName?.split(" ").map((n) => n[0]).join("")
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink text-base">{patient?.fullName}</p>
                    <p className="text-sm text-slate-500">Patient</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{patient?.email}</p>
                  <p>{patient?.phoneNumber || "—"}</p>
                  {patient?.age != null && <p>Age: {patient.age}</p>}
                </div>
              </>
            )}
            <div className="flex-1" aria-hidden="true" />
          </div>
        </aside>

        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm text-left h-full flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <h2 className="text-base font-semibold text-ink">
                {isPatient ? "Edit appointment" : "Appointment"}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(
                    appointment?.status
                  )}`}
                >
                  {appointment?.status
                    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                    : "Pending"}
                </span>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadgeClass(
                    appointment?.paymentStatus
                  )}`}
                >
                  {appointment?.paymentStatus
                    ? appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)
                    : "Unpaid"}
                  {appointment?.paymentAmount
                    ? ` · ${appointment.paymentAmount} ${appointment.paymentCurrency || "ETB"}`
                    : ""}
                </span>
              </div>
            </div>

            {isPatient ? (
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
                  {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
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
                {isUpdateSuccess && <FormSuccess message="Appointment updated." />}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isUpdateLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-70"
                  >
                    {isUpdateLoading && <InlineSpinner className="text-white" />}
                    Save Changes
                  </button>

                  {appointment?.status === "finished" && doctorIdForRating && (
                    <div className="text-sm text-slate-600">
                      {!existingRating ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span>Rate doctor:</span>
                          <RatingStars doctorId={doctorIdForRating} />
                        </div>
                      ) : (
                        <>
                          You rated <span className="font-medium text-ink">{existingRating.value}/5</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Reason</p>
                  <p className="text-ink whitespace-pre-wrap text-base">{appointment?.reason || "—"}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Date</p>
                    <p className="text-ink">{formatAppointmentDate(appointment?.appointmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Time</p>
                    <p className="text-ink">{appointment?.time ? formatTime(appointment.time) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Type</p>
                    <p className="text-ink capitalize">
                      {appointment?.appointmentType?.replace("_", " ") || "—"}
                    </p>
                  </div>
                </div>

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
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFinishLoading ? "Updating…" : "Mark finished"}
                  </button>
                ) : (
                  <p className="text-sm text-slate-500">Doctors can update status when the visit is pending or confirmed.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {doctor?.id && patient?.id && (
        <div className="mt-8">
          <CareHistorySection
            doctorUserId={doctor.id}
            patientUserId={patient.id}
            currentBookingId={appointment?.id ?? id}
          />
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
