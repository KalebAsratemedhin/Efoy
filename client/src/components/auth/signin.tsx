import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSigninMutation } from "../../redux/api/authAPI";
import { InlineSpinner } from "../utils/Spinner";
import { useEffect } from "react";
import { authSelector, setAuth } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { FcGoogle } from "react-icons/fc";
import FormError from "../utils/FormError";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Heart } from "lucide-react";
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface FormData {
  email: string;
  password: string;
  role: string;
}

const Signin = () => {
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: { role: "patient" },
    mode: "onChange",
  });
  const [signinUser, { isError, isLoading, isSuccess, error, data }] = useSigninMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector(authSelector);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    await signinUser(data);
  };

  useEffect(() => {
    if (isSuccess) dispatch(setAuth(data));
    if (authState.id) navigate("/dashboard");
  }, [isSuccess, authState]);

  const inputClass =
    "w-full bg-cream/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-sans";
  const iconClass = "w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2";

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[44%] bg-ink text-white flex-col justify-between p-12 xl:p-16"
      >
        <Link to="/" className="font-display font-bold text-2xl text-white">
          Efoy
        </Link>
        <div>
          <div className="flex items-center gap-3 text-accent mb-6">
            <Heart className="w-8 h-8" />
            <span className="font-display font-semibold text-lg">Welcome back</span>
          </div>
          <h1 className="font-display text-3xl xl:text-4xl font-bold leading-tight mb-4">
            Your health journey continues here.
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">
            Sign in to access your appointments, video calls, and care history.
          </p>
        </div>
        <p className="text-slate-600 text-sm">
          © Efoy · Healthcare, reimagined
        </p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-cream min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display font-bold text-2xl text-ink">
              Efoy
            </Link>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink mb-1">Sign in</h2>
          <p className="text-slate-500 mb-8">Use your email or Google to continue.</p>

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

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {isError && <FormError error={error} />}

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
                  placeholder="••••••••"
                  className={inputClass}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
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

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-accent text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <InlineSpinner className="text-white" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            No account?{" "}
            <Link to="/signup" className="font-semibold text-accent hover:text-accent-hover">
              Sign up
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-slate-400">
            <Link to="/terms" className="underline hover:text-slate-600">Terms</Link>
            {" · "}
            <Link to="/privacy" className="underline hover:text-slate-600">Privacy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signin;
