// socket.js
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

const onlineUsers = new Map();

export const socketHandler = (io) => {
  // jwt auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESSTOKEN || "my_jwt_secret_access_token");
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("✅ User connected:", userId, "Socket ID:", socket.id);

    // Store user's socket ID
    onlineUsers.set(userId, socket.id);

    // Send current online users to the newly connected user
    socket.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    // Broadcast to all other users that this user is online
    socket.broadcast.emit("userOnline", userId);

    console.log("📊 Online users:", Array.from(onlineUsers.keys()));

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", userId, "Socket ID:", socket.id);
      onlineUsers.delete(userId);

      // Broadcast to all users that this user is offline
      io.emit("userOffline", userId);

      console.log("📊 Online users after disconnect:", Array.from(onlineUsers.keys()));
    });

    socket.on("error", (error) => {
      console.error("Socket error for user", userId, ":", error);
    });
  });
}

export const getReceiverSocketId = (userId) => {
  return onlineUsers.get(userId.toString());
}

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
}

export const getAllOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
}


