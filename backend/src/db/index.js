import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    void connectionInstance;
  } catch (error) {
    console.error("MONGODB connection error", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
