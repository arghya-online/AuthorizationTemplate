import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";

const isProduction = process.env.NODE_ENV === "production";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // Save the refresh token in the database
    await user.save({ validateBeforeSave: false }); // Save the user without running validation

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //Step 1: destructure the request body
  //Step 2: check if all the fields are present or not
  //Step 3: check if user already exists or not
  //Step 4: check for images and files
  //Step 5: Upload the images to cloudinary and get the secure url
  //Step 6: hash the password
  //Step 7: save the user to the database
  //Step 8: create user object - creaate entry in db
  //Step 9: remove password and refresh token from the user object
  //Step 10: generate token
  //Step 11: send response to the client

  //Step 1: getting the data from the request body
  const { fullname, name, email, username, password } = req.body;
  const resolvedFullName = fullname ?? name;
  console.log("registerUser body:", { ...req.body, password: "********" });
  console.log(`User ${resolvedFullName} is registered with ${email}`);

  //Step 2: check if all the fields are present or not
  if (!username || !email || !password || !resolvedFullName) {
    throw new apiError(400, "All fields are required");
  }

  //Step 3: check if user already exists or not
  //User.findOne() is used to find a user with the given email in the database.
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  console.log(existedUser);
  if (existedUser) {
    throw new apiError(400, "User already exists");
  }

  //Step 4: check for images and files
  //req.files?.avatar?.[0]?.path
  const avatarLocalPath = req.files?.avatar?.[0]?.path ?? null;
  const coverPhotoLocalPath = req.files?.coverPhoto?.[0]?.path ?? null;
  console.log(avatarLocalPath);
  console.log(coverPhotoLocalPath);

  if (!avatarLocalPath || !coverPhotoLocalPath) {
    throw new apiError(400, "Avatar and cover photo are required");
  }

  //Step 5: Upload the images to cloudinary and get the secure url
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverPhoto = await uploadToCloudinary(coverPhotoLocalPath);
  console.log(avatar);
  console.log(coverPhoto);

  if (!avatar?.secure_url || !coverPhoto?.secure_url) {
    throw new apiError(500, "Error uploading images to Cloudinary");
  }

  //Step 7: save the user to the database
  //Step 8: create user object - create entry in db
  const user = await User.create({
    fullName: resolvedFullName,
    email,
    username: username.toLowerCase().trim(),
    password,
    avatar: avatar.secure_url,
    coverPhoto: coverPhoto.secure_url,
  });

  //It is used to find a user by their ID in the database and return the user object.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new apiError(500, "Error creating user");
  }

  //Step 11: send response to the client
  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  //Step 1: destructure the request body
  //Step 2: check if all the fields are present or not
  //Step 3: check if user exists or not
  //Step 4: compare the password
  //Step 5: generate token ->access token and refresh token
  //Step 6: send cookie and response to the client

  /* Login Process Starts Here */

  //Step 1: getting the data from the request body]
  const { email, username, password } = req.body;
  console.log(`Username: ${username} is trying to login with email: ${email}`);

  //Step 2: check if all the fields are present or not
  if (!email && !username) {
    throw new apiError(400, "Email or username is required");
  }
  if (!password) {
    throw new apiError(400, "Password is required");
  }

  //Step 3: check if user exists or not
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  //Step 4: compare the password
  const isPasswordValid = await user.isPasswordValid(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Password");
  }

  //Step 5: generate token ->access token and refresh token

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  //Step 6: send cookie and response to the client
  const loggedInUser = await User.findByIdAndUpdate(
    user._id,
    { refreshToken }, // Save the refresh token in the database
    { new: true },
  ).select("-password -refreshToken"); // to exclude password and refresh token from the response

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  //Step 7: send response to the client
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, {
        message: "Login successful",
        user: loggedInUser,
        accessToken,
        refreshToken,
      }),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  /* Logout Process Starts Here */

  //Step 1: get the user id from the request object
  const userId = req.user._id;
  console.log(`User is trying to Logout.`);

  //Step 2: find the user in the database and remove the refresh token
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined, // Remove the refresh token from the database
      },
    },
    {
      new: true,
    },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  return res.status(200).json({
    message: "User logged out successfully",
  });
});

export { registerUser, loginUser, logoutUser };
