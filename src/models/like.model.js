import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
  video: {
    type: mongoose.Types.ObjectIdj,
    ref: "Video",
  },
  comment: {
    type: mongoose.Types.ObjectIdj,
    ref: "Comment",
  },
  tweet: {
    type: mongoose.Types.ObjectIdj,
    ref: "Tweet",
  },
  likedBy: {
    type: mongoose.Types.ObjectIdj,
    ref: "User",
  },
},{timestamps:true});

export const like = mongoose.model("like", likeSchema);
