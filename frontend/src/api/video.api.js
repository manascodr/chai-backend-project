import api from "./axios";

const getAllVideos = () => api.get("/videos");

export { getAllVideos };