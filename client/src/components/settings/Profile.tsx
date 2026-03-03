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
import { FaChevronDown } from "react-icons/fa";

interface FormData {
  fullName: string;
  email: string;
  address: string;
  sex: string;
  age: number;
  phoneNumber: string;
}

const Profile = () => {
  const { isSuccess, data: user } = useGetCurrentUserQuery();
  const [updateUser, { isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess }] = useUpdateUserMutation();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormData>();
  const [activeTab, setActiveTab] = useState<'personal' | 'professional'>('personal');

  const onSubmit = async (data: FormData) => {
    const update: UserUpdate = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || undefined,
      ...(data.address && { address: data.address }),
      ...(data.age && { age: data.age }),
      ...(data.sex && { sex: data.sex as 'male' | 'female' | 'other' }),
    };
    if (user?.id) await updateUser({ id: user.id, update });
  };

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        sex: user.sex || '',
        age: user.age,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user, reset]);

  if (!isSuccess || !user) return null;

  const isDoctor = user.role === 'doctor';

  return (
    <div className="max-w-2xl">
      {/* Avatar + identity */}
      <div className="flex items-center gap-5 pb-6 border-b border-slate-200">
        <ProfilePicture user={user} />
        <div>
          <h3 className="text-lg font-semibold text-ink">{user.fullName}</h3>
          <p className="text-slate-600 text-sm">{user.email}</p>
          <p className="text-slate-500 text-xs mt-0.5 capitalize">{user.role}</p>
        </div>
      </div>

      {/* Tabs */}
      {isDoctor && (
        <div className="flex gap-1 mt-6 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'personal'
                ? 'bg-slate-100 text-ink'
                : 'text-slate-500 hover:text-ink hover:bg-slate-50'
            }`}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('professional')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'professional'
                ? 'bg-slate-100 text-ink'
                : 'text-slate-500 hover:text-ink hover:bg-slate-50'
            }`}
          >
            Professional
          </button>
        </div>
      )}

      {activeTab === 'professional' ? (
        <DoctorProfileEdit />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          {isUpdateError && updateError && <FormError error={updateError} />}
          {isUpdateSuccess && <FormSuccess message="Profile updated successfully." />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                {...register('fullName', { required: 'Required' })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Required' })}
                disabled
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone
              </label>
              <input
                id="phoneNumber"
                type="tel"
                {...register('phoneNumber')}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-slate-700 mb-1.5">
                Gender
              </label>
              <Controller
                name="sex"
                control={control}
                render={({ field }) => {
                  const label = field.value === "male" ? "Male" : field.value === "female" ? "Female" : field.value === "other" ? "Other" : "Select gender";
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          id="sex"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-left text-ink bg-white flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent hover:bg-slate-50"
                        >
                          <span className={!field.value ? "text-slate-400" : ""}>{label}</span>
                          <FaChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        <DropdownMenuItem onClick={() => field.onChange("male")}>Male</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => field.onChange("female")}>Female</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => field.onChange("other")}>Other</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1.5">
                Age
              </label>
              <input
                id="age"
                type="number"
                min={1}
                max={120}
                {...register('age', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                Address
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              Save changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
