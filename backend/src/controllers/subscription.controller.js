import mongoose from "mongoose";
import User from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  // prevent user from subscribing to own channel
  if (req.user?._id?.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // check if channel user exists
  const channelExists = await User.exists({ _id: channelId });
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }
  // check if subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  // check if channel user exist
  const channelExists = await User.exists({ _id: channelId });
  if (!channelExists) throw new ApiError(404, "Channel not found");

  // fetch subscribers of the channel and populate subscriber details
  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "fullname email avatar"
  );
  if (subscribers.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribers found"));
  }
  const subscriberList = subscribers.map((sub) => sub.subscriber);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriberList, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!mongoose.isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }
  // check if subscriber user exist
  const isUserExist = await User.exists({ _id: subscriberId });
  if (!isUserExist) throw new ApiError(404, "User not found");

  // fetch channels to which user has subscribed and populate channel details
  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "fullname avatar");
  if (subscriptions.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscriptions found"));
  } else {
    const channelList = subscriptions.map((sub) => sub.channel);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelList,
          "Subscribed channels fetched successfully"
        )
      );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
