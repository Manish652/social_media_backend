import ChatModel from "../models/ChatModel.js";

// GET USER CHATS
const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await ChatModel.find({
      participants: userId
    })
      .populate("participants", "username profilePicture")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// CREATE OR GET CHAT
const getOrCreateChat = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { userId } = req.body;

    let chat = await ChatModel.findOne({
      participants: { $all: [senderId, userId] }
    });

    if (!chat) {
      chat = await ChatModel.create({
        participants: [senderId, userId]
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// DELETE CHAT
const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await ChatModel.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    await ChatModel.findByIdAndDelete(chatId);
    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat" });
  }
};

export { deleteChat, getOrCreateChat, getUserChats };

