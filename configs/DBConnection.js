import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Connect to MongoDB Atlas with a longer timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30s timeout
    });

    console.log("✅ MongoDB connected successfully");
    console.log(`Database URI: ${process.env.MONGO_URI}`);

    // Log connection errors
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    // Ping the DB to wake up free-tier Atlas clusters
    await mongoose.connection.db.command({ ping: 1 });
    console.log("✅ MongoDB cluster ping successful");

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Stop server if DB fails
  }
};

export default connectDB;
