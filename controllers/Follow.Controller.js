import UserModel from "../models/UserModel.js";
import { createNotification } from "./notification.controller.js";

// follow a user

export const followUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetUserId = req.params.userId;

        if (userId.toString() === targetUserId) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            })
        }

        const user = await UserModel.findById(userId);
        const targetUser = await UserModel.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                message: "user not found"
            });
        };

        if (user.following.includes(targetUserId))
            return res.status(400).json({
                message: "Already following this user "

            });

        // add to following and followers
        user.following.push(targetUserId);
        targetUser.followers.push(userId);

        await user.save();
        await targetUser.save();

        // notify the target user of the new follower
        await createNotification("follow", userId, targetUserId, null);

        res.json({
            success: true,
            message: `you are now following ${targetUser.username}`,
            followersCount: targetUser.followers.length,
            followingCount: user.following.length
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Failed to follow user"
        })
    }

}

export const unfollowUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetUserId = req.params.userId;

        const user = await UserModel.findById(userId);
        const targetUser = await UserModel.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: "User not found" });

        if (!user.following.includes(targetUserId))
            return res.status(400).json({ message: "You are not following this user" });

        user.following = user.following.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId.toString());

        await user.save();
        await targetUser.save();

        res.json({
            success: true,
            message: `You unfollowed ${targetUser.username}`,
            followersCount: targetUser.followers.length,
            followingCount: user.following.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to unfollow user" });
    }
};

