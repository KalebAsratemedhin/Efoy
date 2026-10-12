import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useGetDoctorByUserIdQuery } from "../../redux/api/doctorAPI";
import { useUpdateDoctorMutation } from "../../redux/api/doctorAPI";
import { useEffect, useState } from "react";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import { PageLoader } from "../utils/Spinner";
import {
  FaClock,
  FaMoneyBillWave,
  FaGraduationCap,
  FaBriefcase,
  FaExternalLinkAlt,
  FaArrowRight,
} from "react-icons/fa";

interface WorkingHours {
  start: string;
  end: string;
}

interface WorkingHoursForm {
  [key: string]: WorkingHours;
}

interface DoctorProfileForm {
  speciality: string;
  experience: string;
  educationLevel: string;
  sessionPrice: number;
  workingHours: WorkingHoursForm;
}

const inputClass =
  "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-ink placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const defaultWorkingHours: WorkingHoursForm = {
  monday: { start: "08:00", end: "17:00" },
  tuesday: { start: "08:00", end: "17:00" },
  wednesday: { start: "08:00", end: "17:00" },
  thursday: { start: "08:00", end: "17:00" },
  friday: { start: "08:00", end: "17:00" },
  saturday: { start: "08:00", end: "17:00" },
  sunday: { start: "08:00", end: "17:00" },
};

const DoctorProfileEdit = () => {
  const { data: user } = useGetCurrentUserQuery();
  const { data: doctorData, isLoading: isDoctorLoading } = useGetDoctorByUserIdQuery(
    user?.id as string,
    { skip: !user?.id }
  );

  const [
    updateDoctor,
    { isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess, isLoading },
  ] = useUpdateDoctorMutation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DoctorProfileForm>();
  const [workingHours, setWorkingHours] = useState<WorkingHoursForm>(defaultWorkingHours);

  useEffect(() => {
    if (doctorData) {
      reset({
        speciality: doctorData.speciality || "",
        experience: doctorData.experience || "",
        educationLevel: doctorData.educationLevel || "",
        sessionPrice: doctorData.sessionPrice ?? 150,
        workingHours: doctorData.workingHours || defaultWorkingHours,
      });
      if (doctorData.workingHours) setWorkingHours(doctorData.workingHours);
    }
  }, [doctorData, reset]);

  const handleWorkingHourChange = (day: string, field: "start" | "end", value: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const onSubmit = async (data: DoctorProfileForm) => {
    if (!doctorData?.id) return;
    await updateDoctor({
      id: doctorData.id,
      update: {
        speciality: data.speciality,
        experience: data.experience,
        educationLevel: data.educationLevel,
        sessionPrice: data.sessionPrice,
        workingHours,
      },
    });
  };

  if (isDoctorLoading) return <PageLoader label="Loading profile…" />;
  if (!doctorData) {
    return (
      <div className="py-10 text-center text-slate-600 bg-white border border-slate-200 rounded-2xl">
        Doctor profile not found.
      </div>
    );
  }

  const publicProfileHref = user?.id ? `/doctors/${user.id}` : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
      {publicProfileHref && (
        <Link
          to={publicProfileHref}
          className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-accent/40 hover:shadow-md transition-all"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Public profile</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Preview how patients see your board, Q&A, and reviews.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium group-hover:bg-accent group-hover:text-white transition-colors">
            View profile
            <FaArrowRight className="w-3 h-3" />
            <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-70" />
          </span>
        </Link>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-ink">Practice details</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Specialty, credentials, and session pricing shown on your public profile.
          </p>
        </div>

        {isUpdateError && updateError && <FormError error={updateError} />}
        {isUpdateSuccess && <FormSuccess message="Professional profile updated." />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="speciality" className={`${labelClass} flex items-center gap-2`}>
              <FaBriefcase className="text-slate-400 w-3.5 h-3.5" />
              Speciality
            </label>
            <input
              id="speciality"
              type="text"
              {...register("speciality", { required: "Required" })}
              className={inputClass}
              placeholder="e.g. General Medicine"
            />
            {errors.speciality && (
              <p className="text-red-500 text-sm mt-1">{errors.speciality.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="experience" className={labelClass}>
              Experience
            </label>
            <input
              id="experience"
              type="text"
              {...register("experience", { required: "Required" })}
              className={inputClass}
              placeholder="e.g. 5 years"
            />
            {errors.experience && (
              <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="educationLevel" className={`${labelClass} flex items-center gap-2`}>
              <FaGraduationCap className="text-slate-400 w-3.5 h-3.5" />
              Education
            </label>
            <input
              id="educationLevel"
              type="text"
              {...register("educationLevel", { required: "Required" })}
              className={inputClass}
              placeholder="e.g. MD, MBBS"
            />
            {errors.educationLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.educationLevel.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="sessionPrice" className={`${labelClass} flex items-center gap-2`}>
              <FaMoneyBillWave className="text-slate-400 w-3.5 h-3.5" />
              Session price (ETB)
            </label>
            <input
              id="sessionPrice"
              type="number"
              min={0}
              {...register("sessionPrice", {
                required: "Required",
                min: { value: 0, message: "Must be 0 or more" },
              })}
              className={inputClass}
            />
            {errors.sessionPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.sessionPrice.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <FaClock className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">Working hours</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Set availability patients see when booking with you.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Day</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600 w-[7.5rem]">Start</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600 w-[7.5rem]">End</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(({ key, label }) => (
                  <tr
                    key={key}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="py-3 px-4 font-medium text-ink">{label}</td>
                    <td className="py-2 px-4">
                      <input
                        type="time"
                        value={workingHours[key]?.start ?? "08:00"}
                        onChange={(e) => handleWorkingHourChange(key, "start", e.target.value)}
                        className={`${inputClass} py-2 w-full min-w-[7rem]`}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="time"
                        value={workingHours[key]?.end ?? "17:00"}
                        onChange={(e) => handleWorkingHourChange(key, "end", e.target.value)}
                        className={`${inputClass} py-2 w-full min-w-[7rem]`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
        >
          {isLoading ? "Saving…" : "Save professional profile"}
        </button>
      </div>
    </form>
  );
};

export default DoctorProfileEdit;
