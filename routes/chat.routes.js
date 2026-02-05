import express from "express";
import { deleteChat, getOrCreateChat, getUserChats } from "../controllers/chat.controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const ChatRouter = express.Router();

ChatRouter.get("/", AuthProtection, getUserChats);
ChatRouter.post("/create", AuthProtection, getOrCreateChat);
ChatRouter.delete("/:chatId", AuthProtection, deleteChat);

export default ChatRouter;

