import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true },
);

pendingUserSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;
