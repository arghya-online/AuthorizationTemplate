// This middleware will chheck if user is available or not

import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//Step 1: get the token from the request header
//Step 2: verify the token and get the user id from the token
//Step 3: find the user in the database with the user id
//Step 4: if user is not found, throw an error
//Step 5: if user is found, attach the user object to the request object and call next()

export const verifyJWT = asyncHandler(async (req, res, next) => {
  //Step 1: get the token from the request header
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace("Bearer ", ""); // to get the token from the header in the format "Bearer token"

  //Step 2: verify the token and get the user id from the token
  if (!token) {
    throw new apiError(401, "Unauthorized, token is missing");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new apiError(401, "Invalid Access Token, user not found");
  }

  req.user = user; // attach the authenticated user object to the request
  next();
});

export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new apiError(401, "Unauthorized, refresh token is missing");
  }
});
