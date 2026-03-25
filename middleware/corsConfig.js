import dotenv from "dotenv";
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,
  /\.vercel\.app$/,
];

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.some(o =>
        typeof o === "string" ? o === origin : o.test(origin)
      )
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};
