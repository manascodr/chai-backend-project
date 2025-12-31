import axios from "axios";
import api from "./axios.js";

const login = (data) => api.post("/users/login", data);
const register = (data) => api.post("/users/register", data);
const logout = () => api.post("/users/logout");
const getCurrentUser = () => api.get("/users/current-user");

export { login, register, logout, getCurrentUser };
