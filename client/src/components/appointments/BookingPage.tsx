import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetDoctorByIdQuery } from "../../redux/api/doctorAPI";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { useCreateBookingMutation } from "../../redux/api/bookingAPI";
import TimeDate from "./TimeDate";
import { FaClock, FaInfoCircle, FaArrowLeft, FaVideo, FaCreditCard } from "react-icons/fa";

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
  const { data: doctor, isLoading, isError, isSuccess, error } = useGetDoctorByIdQuery(id as string);
  const [createBooking, { isLoading: isCreateLoading, isError: isCreateError, isSuccess: isCreateSuccess, error: createError, data: createdBooking }] = useCreateBookingMutation();

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

  if (isLoading || isCreateLoading) return <Spinner />;
  if (isError || isCreateError) return <Error error={error || createError} />;

  if (!isSuccess || !doctor) return null;

  const name = doctor.userId?.fullName ?? "Doctor";
  const avatarUrl =
    doctor.userId?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&size=200`;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-ink text-sm font-medium mb-6 transition-colors"
      >
        <FaArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Doctor summary */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <h2 className="text-lg font-semibold text-ink">Dr. {name}</h2>
            <p className="text-accent text-sm font-medium">{doctor.speciality}</p>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
              <FaClock className="w-3.5 h-3.5 text-slate-400" />
              {doctor.experience} years experience
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-slate-100 rounded-xl p-6">
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

        <div className="bg-white border border-slate-100 rounded-xl p-6">
          <label className={`${labelClass} flex items-center gap-2`}>
            <FaVideo className="text-slate-500 w-4 h-4" />
            Appointment type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <input
                type="radio"
                value="in_person"
                {...register("appointmentType", { required: "Select appointment type" })}
                className="sr-only"
              />
              <div className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                watch("appointmentType") === "in_person"
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
                <span className="font-medium text-ink">In-person</span>
                <p className="text-slate-500 text-sm mt-0.5">Meet at the hospital</p>
              </div>
            </label>
            <label className="block">
              <input
                type="radio"
                value="virtual"
                {...register("appointmentType", { required: "Select appointment type" })}
                className="sr-only"
              />
              <div className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                watch("appointmentType") === "virtual"
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
                <span className="font-medium text-ink">Video call</span>
                <p className="text-slate-500 text-sm mt-0.5">Online consultation</p>
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
