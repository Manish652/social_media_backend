import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, 
    });

    console.log("MongoDB connected successfully");
    console.log(`Database URI: ${process.env.MONGO_URI}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    await mongoose.connection.db.command({ ping: 1 });
    console.log("MongoDB cluster ping successful");

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); 
  }
};

export default connectDB;
