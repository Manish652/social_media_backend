import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";

export const searchAll = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "No search query provided" });
        }
        // case - insensitive search for users and posts
        const userResult = await UserModel.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { bio: { $regex: query, $options: "i" } }
            ]
        }).select("username email bio profilePicture profilePic").limit(20);

        const postResult = await PostModel.find({
            $or: [
                { caption: { $regex: query, $options: "i" } },
                { tags: { $regex: query, $options: "i" } }
            ]
        })
            .select("caption image video likes comments createdAt tags")
            .populate("userId", "username email profilePicture profilePic")
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({ userResult, postResult });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getTrendingTags = async (req, res) => {
    try {
        const tagsAggregation = await PostModel.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        // Also get from reels
        const reelTagsAggregation = await import("../models/ReelModel.js").then(module => module.default.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]));

        // Merge them
        const tagMap = new Map();
        tagsAggregation.forEach(t => tagMap.set(t._id.toLowerCase(), (tagMap.get(t._id.toLowerCase()) || 0) + t.count));
        reelTagsAggregation.forEach(t => tagMap.set(t._id.toLowerCase(), (tagMap.get(t._id.toLowerCase()) || 0) + t.count));

        const trendingTags = Array.from(tagMap.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return res.status(200).json({ success: true, tags: trendingTags });
    } catch (error) {
        console.log("Error getting trending tags:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}