import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store.js";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FiPlay, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

/**
 * Login Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Provides an authenticated login portal into VividStream:
 * 1. Supports login via Email or Username identifier.
 * 2. Password show/hide toggle for convenient input.
 * 3. Reactive Zustand authentication state persistence.
 */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onTouched",
  });

  const setUser = useAuthStore((s) => s.setUser);

  const onSubmit = async (data) => {
    try {
      const identifier = data.identifier.trim();
      const payload = {
        password: data.password,
      };

      if (identifier.includes("@")) payload.email = identifier;
      else payload.username = identifier;

      const response = await login(payload);
      setUser(response.data.data.user);
      toast.success("Welcome back to VividStream!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-6">
        {/* Brand Header */}
        <header className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 text-lg shadow-md shadow-amber-500/30">
              <FiPlay className="fill-current ml-0.5" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">
              Vivid<span className="text-amber-400">Stream</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight m-0">Welcome back</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">Sign in to your account to continue watching & creating.</p>
        </header>

        {/* Login Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="identifier">
              Email or Username
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="identifier"
                className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
                type="text"
                autoComplete="username"
                placeholder="you@example.com or username"
                {...register("identifier", {
                  required: "Email or username is required",
                })}
              />
            </div>
            {errors.identifier?.message && (
              <span className="text-xs text-rose-400">{errors.identifier.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="password"
                className="w-full bg-[#09090b] text-white pl-11 pr-11 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password?.message && (
              <span className="text-xs text-rose-400">{errors.password.message}</span>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer mt-2"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: "16px", height: "16px" }} />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn /> Sign in
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <footer className="text-center text-xs sm:text-sm text-zinc-400 pt-2 border-t border-white/[0.08]">
          Don't have an account?{" "}
          <Link className="text-amber-400 hover:text-amber-300 font-semibold no-underline" to="/register">
            Create one for free
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default Login;




