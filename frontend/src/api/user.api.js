import api from "./axios";

const getUserChannelProfile = (username) =>  api.get(`/users/c/${username}`);

export { getUserChannelProfile };