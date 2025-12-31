import { useForm } from "react-hook-form";
import { login } from "../api/auth.api";
import { toast } from "react-toastify";

const Login = ({ user, setUser }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      setUser(response.data.data.user);
      toast.success("Login successful");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  return (
    <div className="main-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Login</h2>
        <input {...register("email")} type="email" />
        <input {...register("password")} type="password" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
