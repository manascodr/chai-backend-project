import { useForm } from "react-hook-form";
import { login } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store.js";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Login = () => {
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
  const setUser = useAuthStore((s) => s.setUser); // get setUser from store

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
      toast.success("Login successful");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="page auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Sign in to continue to ChaiTube.</p>
        </header>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="field__label" htmlFor="identifier">
              Email or username
            </label>
            <input
              id="identifier"
              className="input"
              type="text"
              autoComplete="username"
              placeholder="you@example.com"
              {...register("identifier", {
                required: "Email or username is required",
              })}
            />
            {errors.identifier?.message && (
              <div className="field__error">{errors.identifier.message}</div>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
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
            {errors.password?.message && (
              <div className="field__error">{errors.password.message}</div>
            )}
          </div>

          <button className="auth-card__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <footer className="auth-card__footer">
          New here? <Link className="auth-card__link" to="/register">Create an account</Link>
        </footer>
      </div>
    </section>
  );
};

export default Login;
