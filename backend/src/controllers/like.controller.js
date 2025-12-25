import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { comment as Comment } from "../models/comment.model.js";

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

  // check if comment exists
  const commentExists = await Comment.exists({ _id: commentId });
  if (!commentExists) throw new ApiError(404, "Comment not found");

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
  const isTweetExist = await Tweet.exists({ _id: tweetId });
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
  // ensure req.user exists (verifyJWT should set this)
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required");
  }

  const pipeline = [
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $ne: null }, // only likes that reference videos
      },
    },
    { $sort: { createdAt: -1 } }, // most recent likes first
    {
      $lookup: {
        from: "videos", // collection to join with
        localField: "video", // field from Like documents
        foreignField: "_id", // `_id` field from Video documents
        as: "videoDetails", // output array field
        
        // further pipeline to run on Video collection
        pipeline: [ 
          // Optionally you can match only published videos here:
          { $match: { isPublished: true } },

          // lookup owner details for each video
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [{ $project: { username: 1, fullname: 1, avatar: 1 } }],
            },
          },

          // convert ownerDetails array -> single object
          {
            $addFields: {
              owner: { $arrayElemAt: ["$ownerDetails", 0] }, // get first element from ownerDetails array as owner
            },
          },

          // project only the fields we want to return to client
          {
            $project: {
              ownerDetails: 0, // remove ownerDetails array
              description: 0, // remove heavy fields if you want; keep what you need
            },
          },
        ],
      },
    },

    // transform videoDetails array into single object
    {
      $addFields: {
        videoDetails: { $arrayElemAt: ["$videoDetails", 0] },
      },
    },

    // Optionally remove likes where videoDetails is null (video deleted)
    {
      $match: {
        videoDetails: { $ne: null },
      },
    },
  ];

  const likedDocs = await Like.aggregate(pipeline);
  // Map to video objects for response (extract videoDetails)
  const videos = likedDocs.map((d) => d.videoDetails).filter(Boolean); // filter out any nulls (if any)
  const total = videos.length;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, total },
        "Liked videos fetched successfully"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
