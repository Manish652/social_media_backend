import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import OtpModel from "../models/OtpModel.js";
import sendEmail from "../utils/SendEmail.js";
import genarateOtp from "../utils/GenarateOtp.js";
import genarateAccessToken from "../utils/GenarateAcessToken.js";
import genarateRefreshToken from "../utils/GenarateRefreshToken.js";
dotenv.config();
const JWT_SECRET_REFRESHTOKEN = process.env.JWT_SECRET_REFRESHTOKEN || "my_jwt_secret";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = genarateOtp();

    // Save OTP first (even if email fails, we can retry)
    await OtpModel.deleteMany({ email }); // Clear old OTPs for this email
    await OtpModel.create({ email, otp });

    // Wrap email send in a 7-second timeout to beat Vercel's 10-second limit
    const emailTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email service timed out. Please try again.")), 7000)
    );

    await Promise.race([sendEmail(email, otp), emailTimeout]);

    return res.status(200).json({ message: "OTP sent successfully to your email! Check spam if not in inbox." });
  } catch (error) {
    console.error("Error sending OTP:", error.message);

    // Give user a helpful message
    let msg = "Failed to send OTP. Please check your email and try again.";
    if (error.message.includes("timed out")) msg = "Email service is slow right now. Please try again in a moment.";
    if (error.message.includes("Vercel blocks SMTP") || error.message.includes("missing in the Live")) msg = error.message;
    if (error.message.includes("Invalid login")) msg = "Email configuration error. Please contact support.";

    return res.status(500).json({ message: msg });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, bio, profilePictureUrl, otp } = req.body;

    if (!username || !email || !password || !bio || !otp) {
      return res.status(400).json({ message: "All fields and OTP are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Verify OTP
    const otpRecord = await OtpModel.findOne({ email, otp }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Direct client upload
    const profilePicture = profilePictureUrl || "";
    if (profilePicture) {
      console.log("[Client Upload] Using client-uploaded URL:", profilePicture);
    }

    //  Create user in DB
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      profilePicture,
      bio,
    });

    // Delete OTP
    await OtpModel.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = genarateAccessToken(user);
    const refreshToken = genarateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      token: accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers || [],
        following: user.following || [],
        savedPosts: user.savedPosts || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const rfToken = req.cookies.refreshToken;
    if (!rfToken) {
      return res.status(401).json({ message: "Please authenticate. No refresh token provided." });
    }

    jwt.verify(rfToken, JWT_SECRET_REFRESHTOKEN, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token." });
      }

      const user = await UserModel.findById(decoded.userId).select("-password");
      
      const accessToken = genarateAccessToken({ _id: decoded.userId });
      
      res.json({ 
        token: accessToken,
        user: user ? {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followers: user.followers || [],
          following: user.following || [],
          savedPosts: user.savedPosts || [],
        } : undefined
      });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Public profile by ID (safe fields only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "User id is required" });

    const user = await UserModel.findById(id)
      .select("_id username profilePicture bio followers following");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { username, bio, profilePictureUrl } = req.body;
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Direct client upload
    if (profilePictureUrl) {
      console.log("[Client Upload] Using client-uploaded URL:", profilePictureUrl);
      user.profilePicture = profilePictureUrl;
    }

    if (username && user.username !== username) {
      const existingUsername = await UserModel.findOne({ username });
      if (existingUsername && String(existingUsername._id) !== String(user._id)) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    await user.save();
    // Return a minimal safe payload similar to login for consistency
    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers || [],
      following: user.following || [],
      savedPosts: user.savedPosts || [],
    });
  } catch (error) {
    console.error("editProfile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get suggested users (not already following, excluding self), random 10
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    const followingIds = (currentUser.following || []).map(String);
    followingIds.push(String(currentUser._id));

    // Use simple find + limit for broad compatibility
    const users = await UserModel.find({
      _id: { $nin: followingIds }
    })
      .select("_id username profilePicture bio followers")
      .limit(10)
      .lean();

    // Shuffle randomly
    for (let i = users.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [users[i], users[j]] = [users[j], users[i]];
    }

    return res.json(users.slice(0, 10));
  } catch (error) {
    console.error("getSuggestedUsers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
