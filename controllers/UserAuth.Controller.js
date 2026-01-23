import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, bio, profilePictureUrl } = req.body;

    if (!username || !email || !password || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
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

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "760h" });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
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

    if (username) user.username = username;
    if (bio) user.bio = bio;

    await user.save();
    // Return a minimal safe payload similar to login for consistency
    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.error("editProfile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
