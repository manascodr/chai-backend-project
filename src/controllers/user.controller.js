import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


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
      $set: {
        refreshToken: undefined,
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

export { registerUser, loginUser, logoutUser };
