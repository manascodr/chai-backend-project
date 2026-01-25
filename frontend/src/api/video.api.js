import api from "./axios";

const getAllVideos = () => api.get("/videos");
const getVideoById = (id) => api.get(`/videos/${id}`);
const uploadVideo = (videoData) => api.post(`/videos`, videoData);

const togglePublishVideo = (videoId) => {
  return api.patch(`/videos/toggle/publish/${videoId}`);
};

export { getAllVideos, getVideoById, uploadVideo, togglePublishVideo };
