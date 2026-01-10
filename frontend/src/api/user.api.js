import api from "./axios";

const getUserChannelProfile = (username) =>  api.get(`/users/c/${username}`);
const getUserHistory = () =>  api.get(`/users/history`);

export { getUserChannelProfile, getUserHistory };