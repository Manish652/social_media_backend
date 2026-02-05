import express from "express";
import { sendMessage , getChatMessage , getCharParticipants, deleteMessage } from "../controllers/message.controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const messageRouter = express.Router();

messageRouter.post("/send", AuthProtection, sendMessage);
messageRouter.get("/chat/:chatId", AuthProtection, getChatMessage);
messageRouter.get("/participants/:chatId", AuthProtection, getCharParticipants);
messageRouter.delete("/delete/:messageId", AuthProtection, deleteMessage);

export default messageRouter;