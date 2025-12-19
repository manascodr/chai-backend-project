import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // 1. Validate text input
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  // 2. Validate files safely
  const videoFile = req.files?.videoFile?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile || !thumbnailFile) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  // 3. Upload files to Cloudinary
  const uploadedVideo = await uploadOnCloudinary(videoFile.path, "videos");
  const uploadedThumbnail = await uploadOnCloudinary(
    thumbnailFile.path,
    "thumbnails"
  );

  if (!uploadedVideo || !uploadedVideo.secure_url) {
    throw new ApiError(500, "Failed to upload video");
  }

  if (!uploadedThumbnail || !uploadedThumbnail.secure_url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  // 4. Handle duration safely (Cloudinary may return seconds)
  const durationInSeconds = uploadedVideo.duration || 0;

  // 5. Create video document
  const video = await Video.create({
    videoFile: uploadedVideo.secure_url,
    thumbnail: uploadedThumbnail.secure_url,
    title: title.trim(),
    description: description.trim(),
    duration: durationInSeconds,
    owner: req.user._id,
    views: 0,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId).populate(
    "owner",
    "fullname avatar"
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  // If the requester is the owner, return the video without incrementing views
  if (req.user._id.equals(video.owner._id)) {
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video fetched successfully"));
  }
  // Check if the video is published
  if (video.isPublished === false) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "This video is not published yet"));
  }
  // Increment view count
  await video.updateOne({ $inc: { views: 1 } }); // atomic increment of views
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  //owner check
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status toggled successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  // ownership check
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  await video.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const localThumbnail = req.file;
  //TODO: update video details like title, description, thumbnail
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  if (!title && !description && !localThumbnailPath) {
    throw new ApiError(
      400,
      "At least one field (title, description, thumbnail) must be provided for update"
    );
  }
  // Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  // Ownership check
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  // Update fields if provided
  if (title && title !== video.title && title.trim() !== "") {
    video.title = title;
  }
  if (
    description &&
    description !== video.description &&
    description.trim() !== ""
  ) {
    video.description = description;
  }
  if (localThumbnail) {
    // Upload new thumbnail to Cloudinary
    const thumbnailUploadResult = await uploadOnCloudinary(
      localThumbnail.path,
      "thumbnails"
    ); // Upload to 'thumbnails' folder in Cloudinary
    if (!thumbnailUploadResult.secure_url) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }
    video.thumbnail = thumbnailUploadResult.secure_url;
  }
  await video.save();
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
