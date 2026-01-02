import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // convert page & limit to numbers and clamp them
  page = Math.max(1, parseInt(page));
  limit = Math.min(50, parseInt(limit)); // prevent huge payloads
  const skip = (page - 1) * limit; // calculate skip for pagination

  // base filter: only published videos
  const filter = {
    isPublished: true,
  };

  // optional: filter by user
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    filter.owner = userId;
  }

  // optional: search by title or description
  if (query) {
    filter.$or = [
      // $or operator for multiple conditions either title or description
      { title: { $regex: query, $options: "i" } }, // case-insensitive search
      { description: { $regex: query, $options: "i" } }, // regex search in description
    ];
  }

  // whitelist sortable fields
  const allowedSortFields = ["createdAt", "views"];
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = "createdAt";
  }

  const sortOrder = sortType === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // fetch videos
  const videos = await Video.find(filter)
    .sort(sort) // .sort function => sorts the documents based on the sort object
    .skip(skip) // .skip function => skips the first 'n' documents
    .limit(limit) // .limit function => limits the result to 'n' documents
    .populate("owner", "fullname avatar") // populate owner details
    .lean();

  // total count for pagination
  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        page,
        limit,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
      },
      "Videos fetched successfully"
    )
  );
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
  const isAuthenticated = !!req.user?._id;

  let video = await Video.findById(videoId).populate(
    "owner",
    "fullname avatar"
  ); 
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const isOwner =
    isAuthenticated &&
    video.owner?._id &&
    mongoose.Types.ObjectId.isValid(req.user._id) &&
    req.user._id.equals(video.owner._id);

  // If the video is not published, only the owner can view it.
  if (video.isPublished === false && !isOwner) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "This video is not published yet"));
  }

  // Increment view count for non-owner viewers (including unauthenticated)
  if (!isOwner) {
    video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("owner", "fullname avatar");
  }

  // Record watch history for authenticated viewers.
  // Keep most-recent-first, prevent duplicates, and cap list length.

  await User.findByIdAndUpdate(req.user._id, [
    {
      $set: {
        watchHistory: {
          $slice: [
            {
              $concatArrays: [
                [video._id],
                {
                  $filter: {
                    input: "$watchHistory",
                    as: "vid",
                    cond: { $ne: ["$$vid", video._id] },
                  },
                },
              ],
            },
            50,
          ],
        },
      },
    },
  ]);

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

  const hasTitle = typeof title === "string" && title.trim() !== "";
  const hasDescription =
    typeof description === "string" && description.trim() !== "";
  const hasThumbnail = !!localThumbnail;

  if (!hasTitle && !hasDescription && !hasThumbnail) {
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
  if (hasTitle && title.trim() !== video.title) {
    video.title = title.trim();
  }
  if (hasDescription && description.trim() !== video.description) {
    video.description = description.trim();
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
