import CommentModel from "../models/CommentModel.js";
import PostModel from "../models/PostModel.js";
import { createNotification } from "./notification.controller.js";

// add a comment

export const addcomment = async (req,res)=>{

    try{
        const {text} = req.body;
        const userId = req.user._id;
        const postId = req.params.id;

        if(!text) return res.status(400).json({
            success:false,
            message:"Comment text is required"
        })
        const newComment = await CommentModel.create({
            post: postId,
            user: userId,
            text:text
        });

        // keep Post.comments array in sync
        try {
            await PostModel.findByIdAndUpdate(postId, { $addToSet: { comments: newComment._id } });
        } catch {}

        // notify post owner about new comment
        const post = await PostModel.findById(postId).select("userId");
        if (post && post.userId) {
            await createNotification("comment", userId, post.userId, postId);
        }

        return res.status(200).json({
            success:true,
            message:"Comment added successfully",
            comment:newComment
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to add comment"
        })
    }
}

export const getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await CommentModel.find({ post: postId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

export const deletecomment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const postId = req.params.postId;

    const comment = await CommentModel.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    await comment.deleteOne();
    await PostModel.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};
