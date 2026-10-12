import { useForm, Controller } from "react-hook-form";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useEffect, useState } from "react";
import { useUpdateUserMutation } from "../../redux/api/userAPI";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import ProfilePicture from "./ProfilePicture";
import DoctorProfileEdit from "./DoctorProfileEdit";
import { UserUpdate } from "../../types/User";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FaChevronDown, FaUser, FaUserMd } from "react-icons/fa";
import { PHONE_NUMBER_MAX_LENGTH, phoneNumberFieldOptions } from "../../lib/phone";

interface FormData {
  fullName: string;
  email: string;
  address: string;
  sex: string;
  age: number;
  phoneNumber: string;
}

const inputClass =
  "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-ink placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const Profile = () => {
  const { isSuccess, data: user } = useGetCurrentUserQuery();
  const [updateUser, { isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess, isLoading }] =
    useUpdateUserMutation();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormData>();
  const [activeTab, setActiveTab] = useState<"personal" | "professional">("personal");

  const onSubmit = async (data: FormData) => {
    const update: UserUpdate = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || undefined,
      ...(data.address && { address: data.address }),
      ...(data.age && { age: data.age }),
      ...(data.sex && { sex: data.sex as "male" | "female" | "other" }),
    };
    if (user?.id) await updateUser({ id: user.id, update });
  };

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        sex: user.sex || "",
        age: user.age,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user, reset]);

  if (!isSuccess || !user) return null;

  const isDoctor = user.role === "doctor";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-28 sm:h-32 bg-gradient-to-br from-slate-100 via-slate-50 to-accent/10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(8,145,178,0.12),_transparent_55%)]" />
        </div>
        <div className="px-5 sm:px-8 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <ProfilePicture user={user} />
            <div className="pb-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-ink truncate">{user.fullName}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {isDoctor && (
          <div
            className="px-5 sm:px-8 border-t border-slate-100"
            role="tablist"
            aria-label="Profile sections"
          >
            <div className="flex gap-1 -mb-px">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
                className={`inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "personal"
                    ? "border-accent text-accent"
                    : "border-transparent text-slate-500 hover:text-ink"
                }`}
              >
                <FaUser className="w-3.5 h-3.5" />
                Personal
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "professional"}
                onClick={() => setActiveTab("professional")}
                className={`inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "professional"
                    ? "border-accent text-accent"
                    : "border-transparent text-slate-500 hover:text-ink"
                }`}
              >
                <FaUserMd className="w-3.5 h-3.5" />
                Professional
              </button>
            </div>
          </div>
        )}
      </div>

      {activeTab === "professional" && isDoctor ? (
        <DoctorProfileEdit />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 text-left">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-ink">Personal information</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Basic details used across bookings and account messages.
              </p>
            </div>

            {isUpdateError && updateError && <FormError error={updateError} />}
            {isUpdateSuccess && <FormSuccess message="Profile updated successfully." />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  {...register("fullName", { required: "Required" })}
                  className={inputClass}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: "Required" })}
                  disabled
                  className={`${inputClass} text-slate-500 bg-slate-50 cursor-not-allowed`}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className={labelClass}>
                  Phone
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  maxLength={PHONE_NUMBER_MAX_LENGTH}
                  {...register("phoneNumber", phoneNumberFieldOptions)}
                  className={inputClass}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="sex" className={labelClass}>
                  Gender
                </label>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => {
                    const label =
                      field.value === "male"
                        ? "Male"
                        : field.value === "female"
                          ? "Female"
                          : field.value === "other"
                            ? "Other"
                            : "Select gender";
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            id="sex"
                            className={`${inputClass} text-left flex items-center justify-between gap-2 hover:bg-slate-50`}
                          >
                            <span className={!field.value ? "text-slate-400" : ""}>{label}</span>
                            <FaChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[var(--radix-dropdown-menu-trigger-width)]"
                        >
                          <DropdownMenuItem onClick={() => field.onChange("male")}>Male</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => field.onChange("female")}>
                            Female
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => field.onChange("other")}>
                            Other
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }}
                />
              </div>

              <div>
                <label htmlFor="age" className={labelClass}>
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min={1}
                  max={120}
                  {...register("age", { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Address
                </label>
                <input id="address" type="text" {...register("address")} className={inputClass} />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
              >
                {isLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </section>
        </form>
      )}
    </div>
  );
};

export default Profile;
