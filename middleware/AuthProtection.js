import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const AuthProtection = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await UserModel.findById(decoded.userId).select('-password');
            if (!req.user) {
                console.error('Not authorized, user not found for token');
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }
            next();
        } catch (error) {
            console.error('Not authorized, token failed', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        console.error('Not authorized, no token provided');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


export default AuthProtection;

