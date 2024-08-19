import { asyncHandeler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandeler(async (req, res) => {
  // get user details from frontend
  // validation - non empty
  // check if user already exists : username , email
  // check for images, check for avatar
  // upload for cloudinary , check avatar
  // create user object - create enter in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }
  const existUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existUser) {
    throw new ApiError(409, "User already exists");
  }
  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path; // requestimg files from multer to give (its it in server not uploaded in cloudinary till)
  // console.log("Avatar :  ", avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // if coverimg is there then give url or leave it empty
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// login
const loginUser = asyncHandeler(async (req, res) => {
  // req body -> data
  // username / email
  // find the user
  // password check
  // access and referesh token
  // send cookie

  const { username, email, password } = req.body;
  console.log(email);
  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  const user = await User.findOne({
    $and: [{ username }, { email }],
  });

  // const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log("Login attempt with:", { email, password });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandeler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut successfully"));
});

const refreshAccessToken = asyncHandeler(async (req, res) => {
  const incomingRefreshToken = cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expried or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accesToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access token refrehed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
