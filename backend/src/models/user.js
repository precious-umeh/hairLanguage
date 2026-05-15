import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    avatar: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    pendingEmail: { type: String, default: null, sparse: true },
    activeSessions: [
      {
        device: { type: String },
        ip: { type: String },
        location: { type: String },
        userAgent: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    twofactor: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
      tempSecret: { type: String, default: null },
      lastUpdated: { type: Date },
    },
    passwordLastChanged: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;

/*
The sparse: true flag: In MongoDB, if you have unique: true, the database treats null as a value. 
If two users have null for pendingEmail, it will throw a "Duplicate Key" error. sparse: true tells 
MongoDB: "Only enforce uniqueness if the field actually has a string value."
*/
