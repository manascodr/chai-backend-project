import api from "./axios";

const getAllVideos = () => api.get("/videos");
const getVideoById = (id) => api.get(`/videos/${id}`);

export { getAllVideos, getVideoById };