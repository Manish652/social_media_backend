import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./configs/DBConnection.js";
import Commentrouter from "./routes/comment.route.js";
import FollowRouter from "./routes/Follow.routes.js";
import LikeRouter from "./routes/like.route.js";
import NotificationRouter from "./routes/notification.routes.js";
import PostRouter from "./routes/Post.routes.js";
import ReelRouter from "./routes/reel.routes.js";
import searchRouter from "./routes/search.routes.js";
import StoryRouter from "./routes/story.routes.js";
import userRouter from "./routes/user.routes.js";
import uploadRouter from "./routes/upload.routes.js";

dotenv.config();

// Disable mongoose buffering
mongoose.set("bufferCommands", false);

const app = express();

// Allowed origins: local dev + Railway env + any Vercel preview URLs
const FRONTEND_URL = process.env.FRONTEND_URL; // your Railway env variable
const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,     // live frontend URL from Railway env
  /\.vercel\.app$/  // any Vercel preview URL
];

// Dynamic CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server-side
    if (allowedOrigins.some(o => typeof o === "string" ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

const PORT = process.env.PORT || 4000;

// Routes
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

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// HTTP + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(o => typeof o === "string" ? o === origin : o.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

// Start server only after DB connects
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

startServer();
