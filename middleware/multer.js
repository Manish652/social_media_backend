import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

const limits = {
  fileSize: 200 * 1024 * 1024, // 200 MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
