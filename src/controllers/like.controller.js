import mongoose, { isValidObjectId } from "mongoose";
import Like from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { like } from "./../models/like.model";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID"); // Validate videoId

  // Check if video exists
  const videoExists = await Video.exists({ _id: videoId });
  if (!videoExists) throw new ApiError(404, "Video not found");

  // Check if the user has already liked the video
  const isVideoLiked = await Like.exists({
    video: videoId,
    likedBy: req.user._id,
  }); // Returns the document's _id if a match is found, null otherwise (not true/false)

  if (isVideoLiked) {
    // if liked, remove the like
    await Like.deleteOne({ video: videoId, likedBy: req.user._id });
  } else {
    // if not liked, add a new like
    try {
      await Like.create({ video: videoId, likedBy: req.user._id });
    } catch (err) {
      if (err.code !== 11000) throw err; // Ignore duplicate key errors
    }
  }
  const liked = !!(await Like.exists({
    video: videoId,
    likedBy: req.user._id,
  }));
  const totalLikes = await Like.countDocuments({ video: videoId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked, totalLikes },
        "Video like toggled successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!mongoose.isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID"); // Validate commentId
  //check if comment exists.. if not throw error if exist then proceed
  const isCommentliked = await Like.exists({
    comment: commentId,
    likedBy: req.user._id,
  });

  //check idcommentliked by user if yes remove like it else add like
  let liked;
  if (isCommentliked) {
    //remove like
    await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
    liked = false; // after toggling, it's now unliked
  } else {
    //add like
    try {
      await Like.create({ comment: commentId, likedBy: req.user._id });
      liked = true; // after toggling, it's now liked
    } catch (error) {
      if (error.code === 11000) {
        liked = true; // already liked
      } else {
        throw error; // rethrow other errors
      }
    }
  }
  //return response with total likes and liked status
  const totalLikes = await Like.countDocuments({ comment: commentId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked, totalLikes },
        "Comment like toggled successfully"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  // check if tweetId is valid
  if (!mongoose.isValidObjectId(tweetId))
    throw new ApiError(400, "Invalid tweet ID");

  // check if tweet exists if not throw new Error if exist then proceed
  const isTweetExist = await Tweet.exits({ _id: tweetId });
  if (!isTweetExist) throw new ApiError(404, "Tweet not found");

  // check if tweet is liked by the user if yes remove like else add like
  const isTweetLiked = await Like.exists({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  let liked;
  if (isTweetLiked) {
    // remove like
    await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });
    liked = false; // after toggling, it's now unliked
  } else {
    // add like
    try {
      await Like.create({ tweet: tweetId, likedBy: req.user._id });
      liked = true; // after toggling, it's now liked
    } catch (error) {
      if (error.code === 11000) {
        liked = true; // already liked
      } else {
        throw error; // rethrow other errors
      }
    }
  }
  const totalLikes = await Like.countDocuments({ tweet: tweetId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked, totalLikes },
        "Tweet like toggled successfully"
      )
    );

  // return response with total likes and liked status
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // fetch liked videos for the authenticated user
  // this will return Like documents where likedBy is the current user and video field is not null
  //   const likedVideos = await Like.find({likedBy:req.user._id, video: { $ne: null } }) // only likes with video field not null. $ne means "not equal"
  //     .populate('video') // populate video details
  //     .lean();
  //     // example of likedVideos:
  //     //   { _id: ..., video: { _id: ..., title: 'Video 1', ... }, likedBy: ... },

  //   const videos = likedVideos.map(like => like.video); // extract video details

  // another approach using aggregation
  const likedVideosAgg = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $ne: null }, // only likes with video field not null
      },
    },{
        $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"videoDetails"
        }
    },{
        $addFields:{
            videoDetails: { $arrayElemAt: ["$videoDetails", 0] } // get the first element from the array
        }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
