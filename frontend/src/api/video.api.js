import api from "./axios";

const getAllVideos = () => api.get("/videos");
const getVideoById = (id) => api.get(`/videos/${id}`);
const uploadVideo = (videoData) => api.post(`/videos`, videoData);

export { getAllVideos, getVideoById, uploadVideo };
