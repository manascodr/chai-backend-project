import api from "./axios";

const getDashboardStats = async () => api.get("/dashboard/stats");
const getDashboardVideos = async () => api.get("/dashboard/videos");

export { getDashboardStats, getDashboardVideos };