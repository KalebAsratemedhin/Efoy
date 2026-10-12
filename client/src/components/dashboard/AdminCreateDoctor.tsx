import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAdminCreateDoctorMutation } from "../../redux/api/doctorAPI";
import { DoctorCreate } from "../../types/Doctor";
import { InlineSpinner } from "../utils/Spinner";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";

const inputClass =
  "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const AdminCreateDoctor = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DoctorCreate>();
  const [createDoctor, { isLoading, isError, isSuccess, error }] = useAdminCreateDoctorMutation();

  const onSubmit = async (data: DoctorCreate) => {
    await createDoctor(data);
    reset();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-slate-600 text-sm mb-6">
        Add a new doctor with login credentials and professional details.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {isError && error && <FormError error={error} />}
        {isSuccess && <FormSuccess message="Doctor created successfully." />}

        {/* User information */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-base font-semibold text-ink">Account & contact</h2>
            <p className="text-slate-500 text-sm mt-0.5">Login and basic info</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fullName" className={labelClass}>Full name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Dr. Jane Smith"
                {...register("fullName", { required: "Required" })}
                className={inputClass}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                {...register("email", { required: "Required" })}
                className={inputClass}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { required: "Required" })}
                className={inputClass}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className={labelClass}>Phone (optional)</label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phoneNumber")}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Doctor information */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-base font-semibold text-ink">Professional details</h2>
            <p className="text-slate-500 text-sm mt-0.5">Speciality, experience, and education</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="orgID" className={labelClass}>Organization ID</label>
              <input
                id="orgID"
                type="text"
                placeholder="e.g. ORG-001"
                {...register("orgID", { required: "Required" })}
                className={inputClass}
              />
              {errors.orgID && <p className="text-red-500 text-sm mt-1">{errors.orgID.message}</p>}
            </div>
            <div>
              <label htmlFor="speciality" className={labelClass}>Speciality</label>
              <input
                id="speciality"
                type="text"
                placeholder="e.g. General Medicine"
                {...register("speciality", { required: "Required" })}
                className={inputClass}
              />
              {errors.speciality && <p className="text-red-500 text-sm mt-1">{errors.speciality.message}</p>}
            </div>
            <div>
              <label htmlFor="experience" className={labelClass}>Experience</label>
              <input
                id="experience"
                type="text"
                placeholder="e.g. 5 years"
                {...register("experience", { required: "Required" })}
                className={inputClass}
              />
              {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
            </div>
            <div>
              <label htmlFor="educationLevel" className={labelClass}>Education level</label>
              <input
                id="educationLevel"
                type="text"
                placeholder="e.g. MD, MBBS"
                {...register("educationLevel", { required: "Required" })}
                className={inputClass}
              />
              {errors.educationLevel && <p className="text-red-500 text-sm mt-1">{errors.educationLevel.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <InlineSpinner /> Creating…
              </span>
            ) : (
              "Create doctor"
            )}
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateDoctor;
