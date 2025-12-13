import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    // check if videoId is a valid ObjectId 
    throw new ApiError(400, "Invalid video ID");
  }

  const comments = await Comment.find({ video: videoId }).lean();
  if (!comments || comments.length === 0) {
    throw new ApiError(404, "Comments not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    // check if videoId is a valid ObjectId
    throw new ApiError(400, "Invalid video ID");
  }
  const isVideoExist = await Video.exists({ _id: videoId });
  if (!isVideoExist) {
    throw new ApiError(404, "Video not found");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const newComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id, // from the auth middleware
  });

  await newComment.populate("owner", "username avatar"); // will fetch the owner details(username,avatar)

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  if (!content.trim()) {
    throw new ApiError(400, "Content not found");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  // check ownership
  if (String(comment.owner) !== String(req.user._id)) {
    throw new ApiError(401, "Unauthorized");
  }
  // update fields
  comment.content = content.trim();
  await comment.save();
  await comment.populate("owner", "username avatar"); // will fetch the owner details(username,avatar)
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user._id)) {
    throw new ApiError(403, "Unauthorized");
  }

  await comment.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
