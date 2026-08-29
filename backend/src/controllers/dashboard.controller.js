import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // total videos
  const ownerId = req.user._id;
  const totalVideos = await Video.countDocuments({ owner: ownerId });
  // total views
  const videos = await Video.find({ owner: ownerId }); // get all videos of the owner
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  // total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: ownerId,
  });
  // total likes
  const videoIds = videos.map((v) => v._id); // get all video ids of the owner
  const totalLikes = await Like.countDocuments({ video: { $in: videoIds } }); // video: { $in: videoIds } means get all likes for videos whose id is in the videoIds array

  const stats = {
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const allVideos = await Video.find({ owner: req.user._id })
    .sort({
      createdAt: -1, // sort by latest first
    })
    .lean(); // lean() returns plain javascript objects instead of mongoose documents, which is faster and uses less memory
  res
    .status(200)
    .json(
      new ApiResponse(200, allVideos, "Channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
