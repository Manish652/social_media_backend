import express from "express";
import { addReelComment, createReel, deleteReel, getAllReels, getReelComments, likeReel } from "../controllers/Reel.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const ReelRouter = express.Router();

ReelRouter.post("/create", AuthProtection, createReel);
ReelRouter.get("/all", getAllReels);
ReelRouter.post("/like/:id", AuthProtection, likeReel);
ReelRouter.delete("/delete/:id", AuthProtection, deleteReel);
ReelRouter.post("/comment/:id", AuthProtection, addReelComment);
ReelRouter.get("/comments/:id", getReelComments);

export default ReelRouter;

