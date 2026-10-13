import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSignupMutation } from "../../redux/api/authAPI";
import { InlineSpinner } from "../utils/Spinner";
import { SignupCredential } from "../../types/User";
import { FcGoogle } from "react-icons/fc";
import FormError from "../utils/FormError";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { PHONE_NUMBER_MAX_LENGTH, phoneNumberFieldOptions } from "../../lib/phone";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface FormData {
  password: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

const Signup = () => {
  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
  } = useForm<FormData>({ mode: "onChange" });

  const [signupUser, { isError, isLoading, isSuccess, error, data: signupData }] = useSignupMutation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    if (isValid) {
      await signupUser({ ...data, role: "patient" } as SignupCredential);
    }
  };

  useEffect(() => {
    if (isSuccess && signupData) {
      navigate("/verify-email", {
        state: { message: signupData.message, email: signupData.email },
      });
    }
  }, [isSuccess, signupData, navigate]);

  const inputClass =
    "w-full bg-cream/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-sans";
  const iconClass = "w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2";

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[44%] bg-ink text-white flex-col justify-between p-12 xl:p-16">
        <Link to="/" className="font-display font-bold text-2xl text-white">
          Efoy
        </Link>
        <div>
          <div className="flex items-center gap-3 text-accent mb-6">
            <Sparkles className="w-8 h-8" />
            <span className="font-display font-semibold text-lg">Join Efoy</span>
          </div>
          <h1 className="font-display text-3xl xl:text-4xl font-bold leading-tight mb-4">
            Start your health journey today.
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">
            Create an account to book appointments, join video consultations, and keep your care in one place.
          </p>
        </div>
        <p className="text-slate-600 text-sm">
          © Efoy · Healthcare, reimagined
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-cream min-h-screen overflow-auto">
        <div className="w-full max-w-[440px] py-8">
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display font-bold text-2xl text-ink">
              Efoy
            </Link>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink mb-1">Create account</h2>
          <p className="text-slate-500 mb-8">Use Google or email to get started.</p>

          <a
            href={`${backendUrl}/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border-2 border-slate-200 text-ink hover:border-slate-300 hover:bg-white/60 transition-all font-medium"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </a>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isError && <FormError error={error} />}

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="fullName">
                Full name
              </label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  className={inputClass}
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "At least 2 characters" },
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className={inputClass}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                    validate: (v) =>
                      /[a-zA-Z]/.test(v) || "Password must contain at least one letter",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="phoneNumber">
                Phone <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className={iconClass} />
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0911…2345"
                  maxLength={PHONE_NUMBER_MAX_LENGTH}
                  className={inputClass}
                  {...register("phoneNumber", phoneNumberFieldOptions)}
                />
                {errors.phoneNumber && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!isValid || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-accent text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
            >
              {isLoading ? (
                <>
                  <InlineSpinner className="text-white" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-accent hover:text-accent-hover">
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-slate-400">
            <Link to="/terms" className="underline hover:text-slate-600">Terms</Link>
            {" · "}
            <Link to="/privacy" className="underline hover:text-slate-600">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
