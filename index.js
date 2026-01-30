import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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
import helmet from "helmet";
import rateLimit from "express-rate-limit";



dotenv.config();

// Disable mongoose buffering
mongoose.set("bufferCommands", false);


const app = express();
app.set("trust proxy", 1);


const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,
  /\.vercel\.app$/,
];

// CORS


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 100 requests per IP
  standardHeaders: true,   // RateLimit-* headers
  legacyHeaders: false
});


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some((o) =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use("/api", limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: "Internal server error"
  });
});


// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port http://localhost:${PORT} `);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

startServer();
