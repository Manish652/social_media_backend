import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // optional media for image/video stories
  mediaUrl: {
    type: String,
    required: false,
    default: null
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "text"],
    required: true
  },
  caption: {
    type: String,
    trim: true
  },
  // fields for text-only story
  text: {
    type: String,
    trim: true,
    default: ""
  },
  bgColor: {
    type: String,
    trim: true,
    default: "#000000"
  },
  // Story duration in hours (2, 6, 12, 24)
  duration: {
    type: Number,
    enum: [2, 6, 12, 24],
    default: 24
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 } 
  }
});

// Pre-save hook to set expiresAt based on duration
storySchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    const now = this.createdAt || new Date();
    const durationInMs = this.duration * 60 * 60 * 1000; // Convert hours to milliseconds
    this.expiresAt = new Date(now.getTime() + durationInMs);
  }
  next();
});

const StoryModel = mongoose.model("Story", storySchema);
export default StoryModel;
