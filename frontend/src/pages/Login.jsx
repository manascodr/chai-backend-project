import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store.js";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FiPlay, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

/**
 * Login Component
 * 
 * Provides an authenticated login portal into VividStream:
 * 1. Supports login via Email or Username identifier.
 * 2. Password show/hide toggle for convenient mobile and desktop input.
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
    <section className="page auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <header className="auth-card__header">
          <div className="auth-card__brand">
            <div className="app-layout__brandIcon">
              <FiPlay />
            </div>
            <span className="auth-card__brandTitle">Vivid<span>Stream</span></span>
          </div>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Sign in to your account to continue watching & creating.</p>
        </header>

        {/* Login Form */}
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="field__label" htmlFor="identifier">
              Email or Username
            </label>
            <div className="auth-input-wrapper">
              <FiMail className="auth-input-icon" />
              <input
                id="identifier"
                className="input auth-input"
                type="text"
                autoComplete="username"
                placeholder="you@example.com or username"
                {...register("identifier", {
                  required: "Email or username is required",
                })}
              />
            </div>
            {errors.identifier?.message && (
              <div className="field__error">{errors.identifier.message}</div>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <FiLock className="auth-input-icon" />
              <input
                id="password"
                className="input auth-input"
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

          <button className="btn btn-primary auth-card__submit" type="submit" disabled={isSubmitting}>
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
        <footer className="auth-card__footer">
          Don't have an account? <Link className="auth-card__link" to="/register">Create one for free</Link>
        </footer>
      </div>
    </section>
  );
};

export default Login;

