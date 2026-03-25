import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET_ACCESSTOKEN = process.env.JWT_SECRET_ACCESSTOKEN || "my_jwt_secret_access_token";
const genarateAccessToken = (user) => {

    return jwt.sign({ userId: user._id }, JWT_SECRET_ACCESSTOKEN, { expiresIn: "15m" });
}

export default genarateAccessToken;