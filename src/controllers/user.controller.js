import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // Store refresh token in user document
    await user.save({ validateBeforeSave: false }); // Save refresh token to DB without validation
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details form frontend
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
    [fullname, username, email, password].some((field) => field?.trim() === "") // check for empty fields
  ) {
    throw new ApiError(400, "All fields are required");
  }
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
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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
  //  username or error
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  // password verification
  const isPasswordValid = await user.isPasswordCorrect(password); // compare password
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  // generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // fetch fresh user without sensitive fields (use Model, not instance)
  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  // store refresh token in httpOnly cookie
  const options = {
    httpOnly: true,
    secure: true, // set to true if using HTTPS
  };
  return res
    .status(200)
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshtoken", refreshToken, options)
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
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

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
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken })
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

  const user = await User.findById(req.user?._id);
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
  const avatarLocalPath = req.files?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Implementation for updating user avatar goes here
  const coverImageLocalPath = req.files?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }
  const coverImage = await uploadOnCloudinary(avatarLocalPath);

  if (!coverImage) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // get channel profile by username
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        // find user by username
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        // join with subscriptions collection and get subscriber count
        form: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        // join with subscriptions collection and get subscribed channels
        form: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        // add subscriberCount and subscribedToCount fields
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // check if current user is subscribed to this channel
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        // exclude sensitive fields
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

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    );
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

  return res.json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
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
  getWatchHistory,
};
