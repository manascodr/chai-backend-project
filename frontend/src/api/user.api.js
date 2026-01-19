import api from "./axios";

const getUserChannelProfile = (username) => api.get(`/users/c/${username}`);
const getChannelVideos = (username) => api.get(`/users/c/videos/${username}`);
const getUserHistory = () => api.get(`/users/history`);

export { getUserChannelProfile, getChannelVideos, getUserHistory };
