import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET_REFRESHTOKEN = process.env.JWT_SECRET_REFRESHTOKEN || "my_jwt_secret";
const genarateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, JWT_SECRET_REFRESHTOKEN, { expiresIn: "7d" });
}

export default genarateRefreshToken;