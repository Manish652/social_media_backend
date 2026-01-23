import express from "express";
import {likePost,dislikePost} from "../controllers/Like.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const LikeRouter = express.Router();

LikeRouter.post("/:postId/like",AuthProtection,likePost);
LikeRouter.post("/:postId/dislike",AuthProtection,dislikePost);

export default LikeRouter;
