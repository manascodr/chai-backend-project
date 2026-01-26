import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register as registerUser } from "../api/auth.api";

const Register = () => {
	const navigate = useNavigate();

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
			toast.success("Account created. Please log in.");
			navigate("/login", { replace: true });
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "Registration failed");
		}
	};

	return (
		<section className="page auth-page">
			<div className="auth-card">
				<header className="auth-card__header">
					<h1 className="auth-card__title">Create your account</h1>
					<p className="auth-card__subtitle">Join ChaiTube in a minute.</p>
				</header>

				<form className="form" onSubmit={handleSubmit(onSubmit)}>
					<div className="field">
						<label className="field__label" htmlFor="fullname">
							Full name
						</label>
						<input
							id="fullname"
							className="input"
							type="text"
							autoComplete="name"
							placeholder="Your name"
							{...register("fullname", {
								required: "Full name is required",
								minLength: { value: 2, message: "Full name is too short" },
							})}
						/>
						{errors.fullname?.message && (
							<div className="field__error">{errors.fullname.message}</div>
						)}
					</div>

					<div className="field">
						<label className="field__label" htmlFor="username">
							Username
						</label>
						<input
							id="username"
							className="input"
							type="text"
							autoComplete="username"
							placeholder="yourhandle"
							{...register("username", {
								required: "Username is required",
								pattern: {
									value: /^[a-zA-Z0-9_.]+$/,
									message: "Use letters, numbers, underscore or dot",
								},
							})}
						/>
						{errors.username?.message && (
							<div className="field__error">{errors.username.message}</div>
						)}
						<div className="field__hint">This becomes your channel URL.</div>
					</div>

					<div className="field">
						<label className="field__label" htmlFor="email">
							Email
						</label>
						<input
							id="email"
							className="input"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: "Enter a valid email",
								},
							})}
						/>
						{errors.email?.message && (
							<div className="field__error">{errors.email.message}</div>
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
						{errors.password?.message && (
							<div className="field__error">{errors.password.message}</div>
						)}
					</div>

					<div className="field">
						<label className="field__label" htmlFor="avatar">
							Avatar (required)
						</label>
						<input
							id="avatar"
							className="input"
							type="file"
							accept="image/*"
							{...register("avatar", {
								required: "Avatar is required",
							})}
						/>
						{errors.avatar?.message && (
							<div className="field__error">{errors.avatar.message}</div>
						)}
					</div>

					<div className="field">
						<label className="field__label" htmlFor="coverImage">
							Cover image (optional)
						</label>
						<input
							id="coverImage"
							className="input"
							type="file"
							accept="image/*"
							{...register("coverImage")}
						/>
					</div>

					<button className="auth-card__submit" type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create account"}
					</button>
				</form>

				<footer className="auth-card__footer">
					Already have an account? <Link className="auth-card__link" to="/login">Sign in</Link>
				</footer>
			</div>
		</section>
	);
};

export default Register;
