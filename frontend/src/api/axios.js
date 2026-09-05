import axios from "axios";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://vivid-stream.onrender.com");

const api = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  withCredentials: true, // this is required to send cookies with requests
});

export default api;

