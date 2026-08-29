import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register as registerUser } from "../api/auth.api";
import {
  FiPlay,
  FiUser,
  FiAtSign,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiImage,
  FiUserPlus,
} from "react-icons/fi";

/**
 * Register Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Provides an onboarding flow for new users:
 * 1. Collects Fullname, unique Username (channel handle), Email, Password, and Avatar.
 * 2. Provides interactive file dropzones with live thumbnail previews before submitting.
 * 3. Pre-validates user inputs with descriptive error indicators.
 */
const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      avatar: null,
      coverImage: null,
    },
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("fullname", data.fullname.trim());
      formData.append("username", data.username.trim());
      formData.append("email", data.email.trim());
      formData.append("password", data.password);

      if (data.avatar?.[0]) formData.append("avatar", data.avatar[0]);
      if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);

      await registerUser(formData);
      toast.success("Account created successfully! Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-6">
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
          <h1 className="text-2xl font-black text-white tracking-tight m-0">Create your account</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">Join the VividStream creator & viewer community today.</p>
        </header>

        {/* Registration Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Fullname */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="fullname">
                Full Name *
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="fullname"
                  className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Jane Doe"
                  {...register("fullname", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Full name is too short" },
                  })}
                />
              </div>
              {errors.fullname?.message && (
                <span className="text-xs text-rose-400">{errors.fullname.message}</span>
              )}
            </div>

            {/* Username / Handle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="username">
                Username / Handle *
              </label>
              <div className="relative">
                <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="username"
                  className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. janedoe"
                  {...register("username", {
                    required: "Username is required",
                    pattern: {
                      value: /^[a-zA-Z0-9_.]+$/,
                      message: "Letters, numbers, underscores, and dots only",
                    },
                  })}
                />
              </div>
              {errors.username?.message && (
                <span className="text-xs text-rose-400">{errors.username.message}</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="email">
              Email Address *
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="email"
                className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </div>
            {errors.email?.message && (
              <span className="text-xs text-rose-400">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="password">
              Password *
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="password"
                className="w-full bg-[#09090b] text-white pl-11 pr-11 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

          {/* File Uploads (Avatar & Cover) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Avatar Dropzone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="avatar">
                Avatar Image *
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all bg-[#09090b] hover:bg-[#141418]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-14 h-14 rounded-full object-cover mb-2 border border-white/20" />
                ) : (
                  <FiUser className="text-2xl text-amber-400 mb-2" />
                )}
                <input
                  id="avatar"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  type="file"
                  accept="image/*"
                  {...register("avatar", {
                    required: "Avatar is required",
                    onChange: handleAvatarChange,
                  })}
                />
                <div className="text-xs text-zinc-300 pointer-events-none">
                  {avatarPreview ? "Change avatar" : "Choose profile photo"}
                </div>
              </div>
              {errors.avatar?.message && (
                <span className="text-xs text-rose-400">{errors.avatar.message}</span>
              )}
            </div>

            {/* Cover Image Dropzone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="coverImage">
                Channel Banner (Optional)
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all bg-[#09090b] hover:bg-[#141418]">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-14 rounded-lg object-cover mb-2 border border-white/20" />
                ) : (
                  <FiImage className="text-2xl text-amber-400/60 mb-2" />
                )}
                <input
                  id="coverImage"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  type="file"
                  accept="image/*"
                  {...register("coverImage", {
                    onChange: handleCoverChange,
                  })}
                />
                <div className="text-xs text-zinc-300 pointer-events-none">
                  {coverPreview ? "Change banner" : "Choose wide cover image"}
                </div>
              </div>
            </div>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer mt-2"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: "16px", height: "16px" }} />
                Creating your account...
              </>
            ) : (
              <>
                <FiUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <footer className="text-center text-xs sm:text-sm text-zinc-400 pt-2 border-t border-white/[0.08]">
          Already have an account?{" "}
          <Link className="text-amber-400 hover:text-amber-300 font-semibold no-underline" to="/login">
            Sign in here
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default Register;




