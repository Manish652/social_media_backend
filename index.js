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
//  Disable mongoose buffering (fail fast)
mongoose.set("bufferCommands", false);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

// HTTP + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

//  Start ONLY after DB connects
const startServer = async () => {
  try {
    await connectDB(); // wait for MongoDB

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

startServer();
