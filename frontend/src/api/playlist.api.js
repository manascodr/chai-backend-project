import api from "./axios";

// Backend requires both name + description.
// Minimal frontend API: accept name only and reuse it as description.
const createPlaylist = (name) =>
  api.post("/playlist", { name, description: name });

// Backend exposes GET /playlist/user/:userId (no dedicated "my" route).
// We resolve the current user via /users/current-user.
const getMyPlaylists = async () => {
  const meRes = await api.get("/users/current-user");
  const userId = meRes?.data?.data?._id;
  return api.get(`/playlist/user/${userId}`);
};

const getPlaylistById = (playlistId) => api.get(`/playlist/${playlistId}`);

const addToPlaylist = (playlistId, videoId) =>
  api.patch(`/playlist/add/${videoId}/${playlistId}`);

const removeFromPlaylist = (playlistId, videoId) =>
  api.patch(`/playlist/remove/${videoId}/${playlistId}`);

export {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  addToPlaylist,
  removeFromPlaylist,
};
