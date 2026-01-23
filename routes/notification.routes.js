import express from "express";
import {getUserNotifications,markNotificationAsRead,deleteNotification} from "../controllers/notification.controller.js";
import authMiddleware from "../middleware/AuthProtection.js";

const router = express.Router();

router.get("/", authMiddleware, getUserNotifications);
router.put("/:notificationId/read", authMiddleware, markNotificationAsRead);
router.delete("/:notificationId", authMiddleware, deleteNotification);

export default router;
