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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.userId = user._id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId.toString();
    console.log("User connected:", userId, "Socket ID:", socket.id);
    onlineUsers.set(userId, socket.id);

    // Emit online status to all users
    io.emit("userOnline", userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId, "Socket ID:", socket.id);
      onlineUsers.delete(userId);

      // Emit offline status to all users
      io.emit("userOffline", userId);
    });
  });
}

export const getReceiverSocketId = (userId) => {
  return onlineUsers.get(userId.toString());
}

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
}