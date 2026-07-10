import express from "express";
import { addcomment, getComments, deletecomment, replyToComment, toggleCommentLike } from "../controllers/Comment.Controller.js";
import authMiddleware from "../middleware/AuthProtection.js";

const Commentrouter = express.Router();

Commentrouter.post("/:id/comment", authMiddleware, addcomment);
Commentrouter.get("/:id/comments", authMiddleware, getComments);
Commentrouter.delete("/:postId/comment/:commentId", authMiddleware, deletecomment);
// Nested: reply to a specific comment
Commentrouter.post("/reply/:commentId", authMiddleware, replyToComment);
// Like/unlike a comment
Commentrouter.post("/like/:commentId", authMiddleware, toggleCommentLike);

export default Commentrouter;
