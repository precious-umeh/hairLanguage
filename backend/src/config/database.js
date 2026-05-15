import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = function () {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log(`Database connected successfully`))
    .catch((error) => console.error(`Error connecting to database`, error));
};

export default connectDB;
