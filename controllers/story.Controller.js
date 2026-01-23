import StoryModel from "../models/StoryModel.js";

// ✅ Create Story
export const createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { caption = "", mediaType = "image", text = "", bgColor = "#000000", mediaUrl, duration = 24 } = req.body;

    // Validate duration
    const validDurations = [2, 6, 12, 24];
    const storyDuration = validDurations.includes(Number(duration)) ? Number(duration) : 24;

    // Text-only story
    if (mediaType === "text") {
      if (!text.trim()) {
        return res.status(400).json({ success: false, message: "Text is required for text story" });
      }
      const story = await StoryModel.create({
        user: userId,
        mediaType: "text",
        text: text.trim(),
        bgColor,
        caption: caption || "",
        duration: storyDuration
      });
      return res.status(201).json({ success: true, message: "Story created successfully", story });
    }

    // Image/Video story requires mediaUrl from client upload
    if (!mediaUrl) {
      return res.status(400).json({ success: false, message: "Story media URL is required" });
    }

    console.log("[Client Upload] Using client-uploaded URL:", mediaUrl);

    const story = await StoryModel.create({
      user: userId,
      mediaUrl,
      mediaType,
      caption: caption || "",
      duration: storyDuration
    });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to create story"
    });
  }
};

//  Get all stories (recent)
export const getAllStories = async (req, res) => {
  try {
    const stories = await StoryModel.find()
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Stories fetched successfully",
      stories
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stories"
    });
  }
};

// ✅ Get stories of followed users only
export const getFollowingStories = async (req, res) => {
  try {
    const user = req.user;

    // populate following user stories
    const stories = await StoryModel.find({ user: { $in: user.following } })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Stories from followed users",
      stories
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch following stories"
    });
  }
};
