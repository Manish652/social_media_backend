import express from "express";
import { followUser, unfollowUser } from "../controllers/Follow.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const FollowRouter = express.Router();

FollowRouter.post("/:userId/follow", AuthProtection, followUser);
FollowRouter.post("/:userId/unfollow", AuthProtection, unfollowUser);

export default FollowRouter;
