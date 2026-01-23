import express from "express";
import { generateUploadSignature, getUploadConfig } from "../controllers/upload.controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const uploadRouter = express.Router();

// Get upload configuration for client-side uploads (no auth needed - public config)
uploadRouter.get("/config", getUploadConfig);

// Generate signed upload signature (requires auth for security)
uploadRouter.post("/signature", AuthProtection, generateUploadSignature);

export default uploadRouter;
