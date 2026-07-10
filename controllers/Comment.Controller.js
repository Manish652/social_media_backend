import CommentModel from "../models/CommentModel.js";
import PostModel from "../models/PostModel.js";
import { createNotification } from "./notification.controller.js";

// add a top-level comment
export const addcomment = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const postId = req.params.id;

        if (!text) return res.status(400).json({ success: false, message: "Comment text is required" });

        const newComment = await CommentModel.create({
            post: postId,
            user: userId,
            text: text.trim(),
            parentComment: null
        });

        const populatedComment = await CommentModel.findById(newComment._id)
            .populate("user", "username profilePicture")
            .populate({ path: "replies", populate: { path: "user", select: "username profilePicture" } });

        // keep Post.comments array in sync
        try {
            await PostModel.findByIdAndUpdate(postId, { $addToSet: { comments: newComment._id } });
        } catch {}

        // notify post owner about new comment
        const post = await PostModel.findById(postId).select("userId");
        if (post && post.userId) {
            await createNotification("comment", userId, post.userId, postId);
        }

        return res.status(200).json({ success: true, message: "Comment added successfully", comment: populatedComment });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Failed to add comment" });
    }
};

// Reply to an existing comment (nested)
export const replyToComment = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const { commentId } = req.params;

        if (!text) return res.status(400).json({ success: false, message: "Reply text is required" });

        const parentComment = await CommentModel.findById(commentId);
        if (!parentComment) return res.status(404).json({ success: false, message: "Parent comment not found" });

        const reply = await CommentModel.create({
            post: parentComment.post,
            user: userId,
            text: text.trim(),
            parentComment: commentId
        });

        // Add reply to parent's replies array
        await CommentModel.findByIdAndUpdate(commentId, { $push: { replies: reply._id } });

        const populatedReply = await CommentModel.findById(reply._id)
            .populate("user", "username profilePicture");

        // notify the parent comment owner
        if (String(parentComment.user) !== String(userId)) {
            await createNotification("comment", userId, parentComment.user, parentComment.post);
        }

        return res.status(201).json({ success: true, message: "Reply added", reply: populatedReply });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Failed to add reply" });
    }
};

// Get all top-level comments with their replies populated
export const getComments = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await CommentModel.find({ post: postId, parentComment: null })
            .populate("user", "username profilePicture")
            .populate({
                path: "replies",
                populate: [
                    { path: "user", select: "username profilePicture" },
                    {
                        path: "replies",
                        populate: { path: "user", select: "username profilePicture" }
                    }
                ]
            })
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

        // Delete all nested replies recursively
        const deleteReplies = async (id) => {
            const c = await CommentModel.findById(id);
            if (!c) return;
            for (const rid of c.replies) {
                await deleteReplies(rid);
            }
            await CommentModel.findByIdAndDelete(id);
        };
        await deleteReplies(commentId);

        // Remove from parent's replies if it is a reply
        if (comment.parentComment) {
            await CommentModel.findByIdAndUpdate(comment.parentComment, { $pull: { replies: commentId } });
        } else {
            await PostModel.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
        }

        res.json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to delete comment" });
    }
};

// Like / Unlike a comment
export const toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await CommentModel.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        const alreadyLiked = comment.likes.map(String).includes(String(userId));
        if (alreadyLiked) {
            await CommentModel.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
        } else {
            await CommentModel.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });
        }

        res.json({ success: true, liked: !alreadyLiked });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to toggle like" });
    }
};
