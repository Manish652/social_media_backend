import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
    },
  },
  { timestamps: true }
);

// 🔥 Important index
chatSchema.index({ participants: 1 });

const ChatModel = mongoose.model("Chat", chatSchema);
export default ChatModel;
