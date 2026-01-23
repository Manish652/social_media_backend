import CommentModel from "../models/CommentModel.js";
import PostModel from "../models/PostModel.js";
import ReelModel from "../models/ReelModel.js";
import UserModel from "../models/UserModel.js";
import { createNotification } from "./notification.controller.js";

//  Create a new reel
export const createReel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { caption, videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: "Video URL is required" });
    }

    console.log("[Client Upload] Using client-uploaded URL:", videoUrl);

    // Generate thumbnail URL from video URL
    const thumbnailUrl = videoUrl.replace(/\.(mp4|mov|avi)$/i, ".jpg");

    // Create the reel
    const reel = await ReelModel.create({
      userId,
      caption,
      videoUrl,
      thumbnailUrl,
    });

    // Also create a post for the reel (so it shows in profile)
    const post = await PostModel.create({
      userId,
      caption,
      video: videoUrl,
      image: null,
    });

    // Notify followers about the new post
    try {
      const author = await UserModel.findById(userId).select("followers");
      if (author?.followers?.length) {
        await Promise.all(
          author.followers.map(fid => createNotification("post", userId, fid, post._id))
        );
      }
    } catch (e) {
      console.error("createReel notification error:", e.message);
    }

    res.status(201).json({
      success: true,
      message: "Reel uploaded successfully",
      reel,
      post,
    });
  } catch (err) {
    console.error("Create reel error:", err);
    res.status(500).json({ success: false, message: "Failed to upload reel" });
  }
};

//  Get all reels
export const getAllReels = async (req, res) => {
  try {
    const reels = await ReelModel.find()
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reels,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reels" });
  }
};

//  Like or Unlike a reel
export const likeReel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reel = await ReelModel.findById(id);
    if (!reel) {
      return res.status(404).json({ success: false, message: "Reel not found" });
    }

    const isLiked = reel.likes.includes(userId);

    if (isLiked) {
      reel.likes = reel.likes.filter((id) => id.toString() !== userId.toString());
      await reel.save();
      return res.json({ success: true, message: "Reel unliked" });
    } else {
      reel.likes.push(userId);
      await reel.save();
      return res.json({ success: true, message: "Reel liked" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to like reel" });
  }
};

//  Delete a reel
export const deleteReel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reel = await ReelModel.findById(id);

    if (!reel) {
      return res.status(404).json({ success: false, message: "Reel not found" });
    }

    if (reel.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Delete the reel
    await reel.deleteOne();

    // Also delete the associated post (find by video URL and userId)

    try {
      await PostModel.findOneAndDelete({
        userId: userId,
        video: reel.videoUrl
      });
    } catch (e) {
      console.error("Failed to delete associated post:", e.message);
    }

    res.json({ success: true, message: "Reel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete reel" });
  }
};

//  Add a comment to a reel
export const addReelComment = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const reelId = req.params.id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const newComment = await CommentModel.create({
      post: reelId,
      user: userId,
      text: text,
    });

    // Add comment to reel's comments array
    await ReelModel.findByIdAndUpdate(reelId, { $addToSet: { comments: newComment._id } });

    // Notify reel owner about new comment
    const reel = await ReelModel.findById(reelId).select("userId");
    if (reel && reel.userId && reel.userId.toString() !== userId.toString()) {
      await createNotification("comment", userId, reel.userId, reelId);
    }

    const populatedComment = await CommentModel.findById(newComment._id)
      .populate("user", "username profilePicture");

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

//  Get all comments for a reel
export const getReelComments = async (req, res) => {
  try {
    const reelId = req.params.id;
    const comments = await CommentModel.find({ post: reelId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};
