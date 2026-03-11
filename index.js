import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./configs/DBConnection.js";

import ChatRouter from "./routes/chat.routes.js";
import Commentrouter from "./routes/comment.route.js";
import FollowRouter from "./routes/Follow.routes.js";
import LikeRouter from "./routes/like.route.js";
import messageRouter from "./routes/message.routes.js";
import NotificationRouter from "./routes/notification.routes.js";
import PostRouter from "./routes/Post.routes.js";
import ReelRouter from "./routes/reel.routes.js";
import searchRouter from "./routes/search.routes.js";
import StoryRouter from "./routes/story.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import userRouter from "./routes/user.routes.js";

import rateLimit from "express-rate-limit";
import helmet from "helmet";

import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket/socket.js";
import { initSocket } from "./socket/socketInstance.js";

dotenv.config();
mongoose.set("bufferCommands", false);

const app = express();
app.set("trust proxy", 1);

const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,
  /\.vercel\.app$/,
];

// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});

// middlewares
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some(o =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(helmet({ contentSecurityPolicy: false }));
app.use("/api", limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// routes
app.use("/api/user", userRouter);
app.use("/api/post", PostRouter);
app.use("/api/like", LikeRouter);
app.use("/api/comment", Commentrouter);
app.use("/api/follow", FollowRouter);
app.use("/api/story", StoryRouter);
app.use("/api/notification", NotificationRouter);
app.use("/api/reel", ReelRouter);
app.use("/api/search", searchRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chat", ChatRouter);
app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some(o =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  },
  transports: ['websocket', 'polling']
});

initSocket(io);
socketHandler(io);

// start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
  }
};

startServer();
