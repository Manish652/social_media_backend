import express from "express";
import { searchAll, getTrendingTags } from "../controllers/search.controller.js";

const searchRouter = express.Router();

searchRouter.get("/", searchAll);
searchRouter.get("/trending", getTrendingTags);

export default searchRouter;
