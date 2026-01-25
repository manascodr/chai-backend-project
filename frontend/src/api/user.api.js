import api from "./axios";

const getUserChannelProfile = (username) => api.get(`/users/c/${username}`);
const getChannelVideos = (username) => api.get(`/users/c/videos/${username}`);
const getUserHistory = () => api.get(`/users/history`);

export const updateAccountDetails = (data) => {
  return api.patch("/users/update-account", data);
};

/**
 * Update avatar
 */
export const updateUserAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return api.patch("/users/avatar", formData);
};

/**
 * Update cover image
 */
export const updateUserCoverImage = (file) => {
  const formData = new FormData();
  formData.append("coverImage", file);

  return api.patch("/users/cover-image", formData);
};

/**
 * Change password
 * Backend expects: { oldPassword, newPassword }
 */
export const changePassword = (data) => {
  return api.post("/users/change-password", data);
};

export { getUserChannelProfile, getChannelVideos, getUserHistory };
