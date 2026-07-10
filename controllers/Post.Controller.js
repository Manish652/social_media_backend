import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";
import { createNotification } from "./notification.controller.js";

// create post

export const createPost = async (req, res) => {
    try {
        const { caption, mediaUrl, mediaType, tags } = req.body;
        const userId = req.user._id;

        if (!mediaUrl) {
            console.log("[Client Upload] No media URL provided");
        } else {
            console.log("[Client Upload] Using client-uploaded URL:", mediaUrl);
        }

        // Process tags if provided
        let processedTags = [];
        if (tags && Array.isArray(tags)) {
            processedTags = tags.map(tag => tag.trim()).filter(Boolean);
        } else if (typeof tags === "string") {
            processedTags = tags.split(",").map(tag => tag.trim()).filter(Boolean);
        }

        const newpost = await PostModel.create({
            userId,
            caption,
            image: mediaType === "image" ? mediaUrl : null,
            video: mediaType === "video" ? mediaUrl : null,
            tags: processedTags
        })

        // notify all followers about the new post (ignore failures)
        try {
            const author = await UserModel.findById(userId).select("followers");
            if (author?.followers?.length) {
                await Promise.all(
                    author.followers.map(fid => createNotification("post", userId, fid, newpost._id))
                );
            }
        } catch (e) {
            console.error("createPost notification error:", e.message);
        }

        return res.status(200).json({
            success: true,
            message: "Post created successfully",
            newpost
        })
    } catch (err) {
        console.error("Create post error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create post",
            error: err.http_code || err.name || "Unknown error"
        })
    }

}

// get all post

export const getAllPost = async (req, res) => {
    try {
        const posts = await PostModel.find().populate("userId", "username profilePicture").sort({ createdAt: -1 });
        res.json({
            success: true,
            message: "Posts fetched successfully",
            posts
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts"
        })

    }

}

// get single Post By Id

export const getSinglePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await PostModel.findById(id)
            .populate("userId", "username email profilePicture profilePic bio")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username profilePicture"
                }
            });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            post
        });
    } catch (err) {
        console.error("Get single post error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch post"
        });
    }
}

// delete Post

export const deletePost = async (req, res) => {

    try {
        const { id } = req.params;
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        await post.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            id: id
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to delete post"
        })
    }

}

// update Post

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const { caption, tags } = req.body;
        
        let updateData = { caption };
        if (tags !== undefined) {
            let processedTags = [];
            if (Array.isArray(tags)) {
                processedTags = tags.map(tag => typeof tag === 'string' ? tag.trim() : tag).filter(Boolean);
            } else if (typeof tags === "string") {
                processedTags = tags.split(",").map(tag => tag.trim()).filter(Boolean);
            }
            updateData.tags = processedTags;
        }

        await PostModel.findByIdAndUpdate(id, updateData);
        return res.status(200).json({
            success: true,
            message: "Post updated successfully"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to update post"
        })
    }
}

// toggle save post
export const toggleSavePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        const savedArray = user.savedPosts || [];
        const isSaved = savedArray.some(savedId => savedId.toString() === id.toString());
        
        if (isSaved) {
            user.savedPosts = savedArray.filter(postId => postId.toString() !== id.toString());
            await user.save();
            return res.status(200).json({ success: true, message: "Post removed from saved", type: "unsaved" });
        } else {
            user.savedPosts = savedArray;
            user.savedPosts.push(id);
            await user.save();
            return res.status(200).json({ success: true, message: "Post saved successfully", type: "saved" });
        }
    } catch (err) {
        console.error("Toggle save post error:", err);
        return res.status(500).json({ success: false, message: "Failed to save post" });
    }
}
