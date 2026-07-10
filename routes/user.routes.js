import express from "express";
import { editProfile, getProfile, getUserById, loginUser, registerUser, sendOtp, refreshToken, logoutUser, getSuggestedUsers } from "../controllers/UserAuth.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const userRouter = express.Router();

userRouter.post("/send-otp", sendOtp);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", AuthProtection, getProfile);
userRouter.get("/profile/:id", AuthProtection, getUserById);
userRouter.put("/editProfile", AuthProtection, editProfile);
userRouter.get("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/suggested", AuthProtection, getSuggestedUsers);


export default userRouter;

