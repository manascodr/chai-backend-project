import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import {
  deleteFromCloudinary,
  getCloudinaryPublicIdFromUrl,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // Store refresh token in user document
    await user.save({ validateBeforeSave: false }); // Save refresh token to DB without validation
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Token generation failed"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, avatar
  // upload to cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullname, username, email, password } = req.body;

  // Validation
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "") // returns true if any field is empty
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //  if(!fullname || !username || !email || !password){
  //   throw new ApiError(400, "All fields are required");
  //  }

  // email format validation
  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid email address");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }], // check for either username or email
  });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  // handle file uploads
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const newUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // data from req.body
  // username or email
  // find the User
  // verify password
  // access and refresh token
  // send cookies send res

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or password is required");
  }
  //  username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  // password verification
  const isPasswordValid = await user.isPasswordCorrect(password); // user instead of User instance method
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  // generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // again db call to get updated user with refresh token
  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean(); // lean to get plain JS object
           
  // store refresh token in httpOnly cookie              
  const options = {
    httpOnly: true, // prevent client-side JS access               
    secure: true, // set to true if using HTTPS
  };             
  return res        
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        // unset operator to remove fields from db
        refreshToken: 1, // remove refresh token on logout
      },
    },
    { new: true } // return the updated document
  );

  const options = {
    httpOnly: true,
    secure: true, // set to true if using HTTPS
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user = await User.findById(req.user?._id); // req.user is set in auth middleware
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); 

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  // Implementation for updating account details goes here
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // Implementation for updating user avatar goes here
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const existingUser = await User.findById(req.user?._id).select("avatar");
  const oldAvatarUrl = existingUser?.avatar;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  // delete old avatar from cloudinary

  if (oldAvatarUrl && typeof oldAvatarUrl === "string") {
    const publicId = getCloudinaryPublicIdFromUrl(oldAvatarUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "image");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Implementation for updating user avatar goes here
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const existingUser = await User.findById(req.user?._id).select("coverImage");
  const oldCoverUrl = existingUser?.coverImage;

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(500, "Cover image upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  if (oldCoverUrl && typeof oldCoverUrl === "string") {
    const publicId = getCloudinaryPublicIdFromUrl(oldCoverUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "image");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // Extract username from URL parameters (e.g., /c/:username)
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    // STAGE 1: Match the specific user by their username (case-insensitive)
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },

    // STAGE 2: Fetch all subscribers of this channel
    // Looks into the 'subscriptions' collection where 'channel' matches this user's '_id'
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers", // Output array of subscriber documents
      },
    },

    // STAGE 3: Fetch all channels this user is subscribed to
    // Looks into the 'subscriptions' collection where 'subscriber' matches this user's '_id'
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", // Output array of channel documents this user subscribed to
      },
    },

    // STAGE 4: Calculate derived metrics and subscription status
    {
      $addFields: {
        // Count total subscribers by getting array length
        subscribersCount: { $size: "$subscribers" },

        // Count how many channels this user is subscribed to
        channelsSubscribedToCount: { $size: "$subscribedTo" },

        // Check if the currently logged-in user (req.user?._id) is in the channel's subscribers list which we got earlier from counting channels field
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // STAGE 5: Project only the required public fields
    // Strips out sensitive fields (password, tokens) and heavy raw lookup arrays (subscribers, subscribedTo)
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  // Aggregate always returns an array; if no user matched, channel array is empty
  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  // channel[0] contains the single aggregated profile document
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // Implementation for fetching channel videos goes here
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.findOne({
    username: username.toLowerCase(),
  }).select("_id"); // get channel's user id

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const videos = await Video.find({
    owner: channel._id,
    isPublished: true,
  })
    .sort({
      createdAt: -1,
    })
    .populate("owner", "fullname username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // match current user
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $arrayElemAt: ["$owner", 0] },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new ApiError(404, "User not found");
  }

  return res.json(
    new ApiResponse(
      200,
      user[0].watchHistory || [],
      "Watch history fetched successfully"
    )
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getChannelVideos,
  getWatchHistory,
};
