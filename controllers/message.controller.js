import ChatModel from "../models/ChatModel.js";
import MessageModel from "../models/MessageModel.js";
import { getReceiverSocketId } from "../socket/socket.js";
import { getIo } from "../socket/socketInstance.js";
import { createNotification } from "./notification.controller.js";

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { chatId, receiverId, text, image } = req.body;

    console.log("[sendMessage] Request:", { senderId: senderId.toString(), chatId, receiverId, text });

    if (!chatId || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await MessageModel.create({
      chatId,
      senderId,
      receiverId,
      text,
      image
    });

    console.log("[sendMessage] Message created:", message._id);

    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });

    // Create notification for receiver
    await createNotification("message", senderId, receiverId, null);

    // Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    console.log("[sendMessage] Receiver socket ID:", receiverSocketId);
    if (receiverSocketId) {
      getIo().to(receiverSocketId).emit("newMessage", message);
      console.log("[sendMessage] Emitted to receiver");
    } else {
      console.log("[sendMessage] Receiver not online");
    }

    // Also emit to sender (for multi-device support)
    const senderSocketId = getReceiverSocketId(senderId.toString());
    console.log("[sendMessage] Sender socket ID:", senderSocketId);
    if (senderSocketId) {
      getIo().to(senderSocketId).emit("newMessage", message);
      console.log("[sendMessage] Emitted to sender");
    } else {
      console.log("[sendMessage] Sender not online");
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// GET CHAT MESSAGES
const getChatMessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await MessageModel.find({ chatId })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// GET CHAT PARTICIPANTS
const getCharParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatModel.findById(chatId)
      .populate("participants", "username profilePicture");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat.participants);
  } catch (error) {
    res.status(500).json({ message: "Failed to get participants" });
  }
};

// DELETE MESSAGE
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message" });
  }
};

export {
  deleteMessage, getCharParticipants, getChatMessage, sendMessage
};

