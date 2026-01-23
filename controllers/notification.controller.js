import NotificationModel from "../models/NotificationModel.js";

//  Create Notification
export const createNotification = async (type, fromUserId, toUserId, postId = null) => {
  try {
    // Prevent self-notifications
    if (fromUserId.toString() === toUserId.toString()) return;

    // Avoid duplicate notification for same action (optional)
    const exists = await NotificationModel.findOne({
      user: toUserId,
      fromUser: fromUserId,
      type,
      post: postId,
    });

    if (!exists) {
      await NotificationModel.create({
        user: toUserId,
        fromUser: fromUserId,
        type,
        post: postId,
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};


//  Get All Notifications for Logged-in User
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await NotificationModel.find({ user: userId })
      .populate("fromUser", "username profilePicture")
      .populate("post", "image caption")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};


//  Mark Notification as Read
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to mark as read",
    });
  }
};


// Delete Notification (optional)
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await NotificationModel.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};
