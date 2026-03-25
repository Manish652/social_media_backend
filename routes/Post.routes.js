import express from "express";
import { createPost, deletePost, getAllPost, getSinglePost, updatePost, toggleSavePost } from "../controllers/Post.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const PostRouter = express.Router();

// Direct client-side uploads (no multer needed)
PostRouter.post("/create", AuthProtection, createPost);
PostRouter.get("/", AuthProtection, getAllPost);
PostRouter.get("/:id", AuthProtection, getSinglePost);
PostRouter.put("/update/:id", AuthProtection, updatePost);
PostRouter.delete("/delete/:id", AuthProtection, deletePost);
PostRouter.post("/:id/save", AuthProtection, toggleSavePost);

export default PostRouter;


