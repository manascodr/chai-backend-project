import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "./../models/video.model";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: [],
  });
  res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const isUserExists = await User.exists({ _id: userId });
  const playLists = await Playlist.find({ owner: userId }).populate(
    "videos",
    "title thumbnail duration"
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, playList, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  const playlist = await Playlist.findById(playlistId)
    .populate("videos", "title thumbnail duration")
    .populate("owner", "username email")
    .lean();
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID");
  }
  if (!(await Video.exists({ _id: videoId }))) {
    throw new ApiError(404, "Video not found");
  }
  // fetch playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  // check playlist owner
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }
  // check if video already exists in playlist
  if (playlist.videos.some((vid) => vid.equals(videoId))) {
    // returns true if video exists
    throw new ApiError(400, "Video already exists in the playlist");
  }
  playlist.videos.push(videoId);
  await playlist.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID");
  }
  // fetch playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  // check playlist owner
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }
  // check if video exists in playlist
  if (!playlist.videos.some((vid) => vid.equals(videoId))) {
    // returns true if video does not exist
    throw new ApiError(400, "Video not found in the playlist");
  }

  // .eauals is a mongoose method to compare object ids
  playlist.videos = playlist.videos.filter((vid) => !vid.equals(videoId)); // if not equal, keep it in the array .
  await playlist.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  //fetch playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    // check playlist owner
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }
    await playlist.deleteOne({_id: playlistId});
  res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!name && !description) {
    throw new ApiError(400, "Name or description is required to update");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  // fetch playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  // check playlist owner
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }
  if (name) playlist.name = name?.trim();
  if (description) playlist.description = description?.trim();

  await playlist.save();
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
