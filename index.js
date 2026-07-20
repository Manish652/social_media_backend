import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./configs/DBConnection.js";
import cookieParser from "cookie-parser";
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
import helmet from "helmet";
import { corsOptions } from "./middleware/corsConfig.js";
import limiter from "./middleware/rateLimitConfig.js";
import errorHandler from "./middleware/errorHandler.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket/socket.js";
import { initSocket } from "./socket/socketInstance.js";

dotenv.config();
mongoose.set("bufferCommands", false);

const app = express();
app.set("trust proxy", 1);

// security middlewares
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use("/api", limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// application routes
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

// health check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// global error handler middleware
app.use(errorHandler);

// socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
        /\.vercel\.app$/,
      ];
      if (!origin) return callback(null, true);
      const isAllowed = allowed.some(o =>
        typeof o === "string" ? o === origin : o?.test?.(origin)
      );
      callback(isAllowed ? null : new Error("Socket CORS blocked"), isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
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
