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
 * Register Component
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
    <section className="page auth-page">
      <div className="auth-card auth-card--wide">
        {/* Brand Header */}
        <header className="auth-card__header">
          <div className="auth-card__brand">
            <div className="app-layout__brandIcon">
              <FiPlay />
            </div>
            <span className="auth-card__brandTitle">Vivid<span>Stream</span></span>
          </div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">Join the VividStream creator & viewer community today.</p>
        </header>

        {/* Registration Form */}
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="field__grid">
            {/* Fullname */}
            <div className="field">
              <label className="field__label" htmlFor="fullname">
                Full Name *
              </label>
              <div className="auth-input-wrapper">
                <FiUser className="auth-input-icon" />
                <input
                  id="fullname"
                  className="input auth-input"
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
                <div className="field__error">{errors.fullname.message}</div>
              )}
            </div>

            {/* Username / Handle */}
            <div className="field">
              <label className="field__label" htmlFor="username">
                Username / Handle *
              </label>
              <div className="auth-input-wrapper">
                <FiAtSign className="auth-input-icon" />
                <input
                  id="username"
                  className="input auth-input"
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
                <div className="field__error">{errors.username.message}</div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label className="field__label" htmlFor="email">
              Email Address *
            </label>
            <div className="auth-input-wrapper">
              <FiMail className="auth-input-icon" />
              <input
                id="email"
                className="input auth-input"
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
              <div className="field__error">{errors.email.message}</div>
            )}
          </div>

          {/* Password */}
          <div className="field">
            <label className="field__label" htmlFor="password">
              Password *
            </label>
            <div className="auth-input-wrapper">
              <FiLock className="auth-input-icon" />
              <input
                id="password"
                className="input auth-input"
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
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password?.message && (
              <div className="field__error">{errors.password.message}</div>
            )}
          </div>

          {/* File Uploads (Avatar & Cover) */}
          <div className="field__grid">
            {/* Avatar Dropzone */}
            <div className="field">
              <label className="field__label" htmlFor="avatar">
                Avatar Image *
              </label>
              <div className="upload__dropzone auth-file-zone">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="auth-preview-avatar" />
                ) : (
                  <FiUser className="upload__dropzoneIcon" />
                )}
                <input
                  id="avatar"
                  className="upload__fileInput"
                  type="file"
                  accept="image/*"
                  {...register("avatar", {
                    required: "Avatar is required",
                    onChange: handleAvatarChange,
                  })}
                />
                <div className="upload__dropzoneText">
                  {avatarPreview ? "Change avatar" : "Choose profile photo"}
                </div>
              </div>
              {errors.avatar?.message && (
                <div className="field__error">{errors.avatar.message}</div>
              )}
            </div>

            {/* Cover Image Dropzone */}
            <div className="field">
              <label className="field__label" htmlFor="coverImage">
                Channel Banner (Optional)
              </label>
              <div className="upload__dropzone auth-file-zone">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="auth-preview-cover" />
                ) : (
                  <FiImage className="upload__dropzoneIcon" />
                )}
                <input
                  id="coverImage"
                  className="upload__fileInput"
                  type="file"
                  accept="image/*"
                  {...register("coverImage", {
                    onChange: handleCoverChange,
                  })}
                />
                <div className="upload__dropzoneText">
                  {coverPreview ? "Change banner" : "Choose wide cover image"}
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary auth-card__submit" type="submit" disabled={isSubmitting}>
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

        <footer className="auth-card__footer">
          Already have an account? <Link className="auth-card__link" to="/login">Sign in here</Link>
        </footer>
      </div>
    </section>
  );
};

export default Register;

