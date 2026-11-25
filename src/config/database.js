
import mongoose from "mongoose";

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment variables.");
  }

  if (!process.env.DB_NAME) {
    throw new Error("DB_NAME is missing from environment variables.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
    console.log(`Database name: ${connection.connection.name}`);

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDatabase;
