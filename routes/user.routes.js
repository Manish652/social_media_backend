import express from "express";
import { editProfile, getProfile, getUserById, loginUser, registerUser } from "../controllers/UserAuth.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", AuthProtection, getProfile);
userRouter.get("/profile/:id", AuthProtection, getUserById);
userRouter.put("/editProfile", AuthProtection, editProfile);


export default userRouter;
