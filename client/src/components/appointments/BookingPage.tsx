import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetDoctorByIdQuery } from "../../redux/api/doctorAPI";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import { PageLoader } from "../utils/Spinner";
import Error from "../utils/Error";
import BackButton from "../utils/BackButton";
import { useCreateBookingMutation } from "../../redux/api/bookingAPI";
import TimeDate from "./TimeDate";
import { FaClock, FaInfoCircle, FaVideo, FaCreditCard } from "react-icons/fa";
import { authSelector } from "../../redux/slices/authSlice";
import { useEffect } from "react";
import { toast } from "sonner";

interface FormData {
  appointmentDate: string;
  time: string;
  reason: string;
  appointmentType: string;
}

const inputClass =
  "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useSelector(authSelector);
  const canBook = auth.role !== "doctor" && auth.role !== "admin";
  const { data: doctor, isLoading, isError, isSuccess, error } = useGetDoctorByIdQuery(id as string, {
    skip: !canBook,
  });
  const [createBooking, { isLoading: isCreateLoading, isError: isCreateError, isSuccess: isCreateSuccess, error: createError, data: createdBooking }] = useCreateBookingMutation();

  useEffect(() => {
    if (!canBook) {
      toast.error("Doctor accounts can’t book appointments.");
      navigate("/doctors", { replace: true });
    }
  }, [canBook, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      appointmentDate: new Date().toISOString().split("T")[0],
      appointmentType: "in_person",
    }
  });

  const onSubmit = async (data: FormData) => {
    const bookingData = {
      ...data,
      doctorId: doctor?.userId?.id,
    };
    await createBooking(bookingData).unwrap();
  };

  if (!canBook) return <PageLoader label="Redirecting…" />;
  if (isLoading || isCreateLoading) return <PageLoader label="Loading…" />;
  if (isError || isCreateError) return <Error error={error || createError} />;

  if (!isSuccess || !doctor) return null;

  const name = doctor.userId?.fullName ?? "Doctor";
  const doctorUserId = doctor.userId?.id;
  const profileHref = doctorUserId ? `/doctors/${doctorUserId}` : undefined;
  const avatarUrl =
    doctor.userId?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&size=200`;

  return (
    <div className="max-w-5xl mx-auto">
      <BackButton onClick={() => navigate(-1)} className="mb-6" />

      {/* Doctor summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
        <div className="flex items-center gap-5">
          {profileHref ? (
            <Link to={profileHref} className="shrink-0">
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 rounded-full object-cover bg-slate-50 ring-2 ring-slate-100 hover:ring-accent/30 transition-shadow"
                referrerPolicy="no-referrer"
              />
            </Link>
          ) : (
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover bg-slate-50 ring-2 ring-slate-100"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            {profileHref ? (
              <Link
                to={profileHref}
                className="text-xl font-semibold text-ink hover:text-accent transition-colors"
              >
                Dr. {name}
              </Link>
            ) : (
              <h2 className="text-xl font-semibold text-ink">Dr. {name}</h2>
            )}
            <p className="text-accent text-base font-medium mt-0.5">{doctor.speciality}</p>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
              <FaClock className="w-3.5 h-3.5 text-slate-400" />
              {doctor.experience} years experience
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <label htmlFor="reason" className={`${labelClass} flex items-center gap-2`}>
            <FaInfoCircle className="text-slate-500 w-4 h-4" />
            Reason for appointment
          </label>
          <textarea
            id="reason"
            {...register("reason", { required: "Reason is required" })}
            className={`${inputClass} min-h-[100px] resize-y`}
            placeholder="Describe your symptoms or reason for visit..."
            rows={4}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <label className={`${labelClass} flex items-center gap-2`}>
            <FaVideo className="text-slate-500 w-4 h-4" />
            Appointment type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <input
                type="radio"
                value="in_person"
                {...register("appointmentType", { required: "Select appointment type" })}
                className="sr-only"
              />
              <div className={`rounded-xl border-2 p-5 cursor-pointer transition-colors ${
                watch("appointmentType") === "in_person"
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
                <span className="font-medium text-ink text-base">In-person</span>
                <p className="text-slate-500 text-sm mt-1">Meet at the hospital</p>
              </div>
            </label>
            <label className="block">
              <input
                type="radio"
                value="virtual"
                {...register("appointmentType", { required: "Select appointment type" })}
                className="sr-only"
              />
              <div className={`rounded-xl border-2 p-5 cursor-pointer transition-colors ${
                watch("appointmentType") === "virtual"
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
                <span className="font-medium text-ink text-base">Video call</span>
                <p className="text-slate-500 text-sm mt-1">Online consultation</p>
              </div>
            </label>
          </div>
          {errors.appointmentType && (
            <p className="text-red-500 text-sm mt-2">{errors.appointmentType.message}</p>
          )}
        </div>

        <TimeDate
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          doctorId={doctor?.userId?.id}
        />

        {isCreateError && createError && <FormError error={createError} />}
        {isCreateSuccess && (
          <div className="space-y-4">
            <FormSuccess message="Appointment created. Complete payment to confirm." />
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FaCreditCard className="text-amber-600 w-5 h-5" />
                <h3 className="font-semibold text-amber-900">Payment required</h3>
              </div>
              <p className="text-amber-800 text-sm mb-4">
                Your appointment is scheduled. Pay now to confirm it.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/payment/${createdBooking?.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 transition-colors"
                >
                  <FaCreditCard className="w-4 h-4" />
                  Pay now — ${doctor?.sessionPrice ?? 150}
                </Link>
                <button
                  type="button"
                  onClick={() => navigate("/appointments")}
                  className="px-4 py-2.5 border border-amber-300 text-amber-800 rounded-lg font-medium text-sm hover:bg-amber-100 transition-colors"
                >
                  Pay later
                </button>
              </div>
            </div>
          </div>
        )}

        {!isCreateSuccess && (
          <button
            type="submit"
            className="w-full py-3 px-4 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
          >
            Book appointment
          </button>
        )}
      </form>
    </div>
  );
};

export default BookingPage;
