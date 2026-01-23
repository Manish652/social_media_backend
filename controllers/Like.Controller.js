import LikeModel from "../models/LikeModel.js";
import PostModel from "../models/PostModel.js";
import { createNotification } from "./notification.controller.js";

// Like a Post
export const likePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    // Check if user already liked the post
    const existingLike = await LikeModel.findOne({ post: postId, user: userId });
    if (existingLike) {
      return res.status(400).json({ success: false, message: "Post already liked" });
    }

    const newLike = await LikeModel.create({ post: postId, user: userId });

    // reflect like in PostModel.likes array
    await PostModel.updateOne({ _id: postId }, { $addToSet: { likes: userId } });

    // Notify post owner
    const post = await PostModel.findById(postId).select("userId");
    if (post && post.userId) {
      await createNotification("like", userId, post.userId, postId);
    }

    return res.json({
      success: true,
      message: "Post liked",
      like: newLike,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Failed to like post" });
  }
};

// Dislike / Unlike a Post
export const dislikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    // Find the like document
    const existingLike = await LikeModel.findOne({ post: postId, user: userId });
    if (!existingLike) {
      return res.status(400).json({ success: false, message: "Post not liked yet" });
    }

    await existingLike.deleteOne();

    // reflect unlike in PostModel.likes array
    await PostModel.updateOne({ _id: postId }, { $pull: { likes: userId } });

    return res.json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Failed to unlike post" });
  }
};
