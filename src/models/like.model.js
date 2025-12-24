import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
      default: null,
    },
    comment: {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    tweet: {
      type: mongoose.Types.ObjectId,
      ref: "Tweet",
      default: null,
    },
    likedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure a Like targets exactly one entity.
likeSchema.path("video").validate(function () {
  const targets = [this.video, this.comment, this.tweet].filter(Boolean);
  return targets.length === 1;
}, "A like must reference exactly one of: video, comment, tweet");

// Prevent duplicate likes per (target, user).
// Partial unique indexes allow other targets to be null without colliding.
likeSchema.index(
  { video: 1, likedBy: 1 },
  {
    unique: true,
    partialFilterExpression: { video: { $exists: true, $ne: null } },
  }
);
likeSchema.index(
  { comment: 1, likedBy: 1 },
  {
    unique: true,
    partialFilterExpression: { comment: { $exists: true, $ne: null } },
  }
);
likeSchema.index(
  { tweet: 1, likedBy: 1 },
  {
    unique: true,
    partialFilterExpression: { tweet: { $exists: true, $ne: null } },
  }
);

export const Like = mongoose.model("like", likeSchema);
