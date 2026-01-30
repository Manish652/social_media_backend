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
            caption: { $regex: query, $options: "i" }
        })
            .select("caption image video likes comments createdAt")
            .populate("userId", "username email profilePicture profilePic")
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({ userResult, postResult });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}