import { useForm } from "react-hook-form";
import { login } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store.js";
import { ToastContainer,toast } from 'react-toastify';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const setUser = useAuthStore((s) => s.setUser); // get setUser from store

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      setUser(response.data.data.user);
      toast.success("Login successful");
    } catch (err) {
      console.error(err);
      ToastContainer.error("Login failed");
    }
  };

  return (
    <>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("email")} type="email" placeholder="email" />
        <input
          {...register("password")}
          type="password"
          placeholder="password"
        />
        <button type="submit">Login</button>
      </form>
    </>
  );
};

export default Login;
