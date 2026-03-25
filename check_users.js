import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://manish_db:lucariodb@cluster0.yncfcku.mongodb.net/?appName=Cluster0";

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");
  const users = await mongoose.connection.db.collection("users").find({}).toArray();
  console.log("Users in DB:");
  users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Username: ${u.username}`));
  process.exit(0);
};

run();
