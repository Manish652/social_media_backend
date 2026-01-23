import multer from "multer";

const storage = multer.memoryStorage();

// Allow only images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// Set 200MB upload limit (for videos and high-res images)
const limits = {
  fileSize: 200 * 1024 * 1024, // 200 MB
};

// Create the upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
