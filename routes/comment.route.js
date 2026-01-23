import express from "express";
import { addcomment, getComments, deletecomment } from "../controllers/Comment.Controller.js";
import authMiddleware from "../middleware/AuthProtection.js";

const Commentrouter = express.Router();

Commentrouter.post("/:id/comment", authMiddleware, addcomment);
Commentrouter.get("/:id/comments", authMiddleware, getComments);
Commentrouter.delete("/:postId/comment/:commentId", authMiddleware, deletecomment);

export default Commentrouter;
