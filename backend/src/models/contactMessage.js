import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "contacted", "archived"],
      default: "pending",
      lowercase: true,
    },
    previousStatus: { type: String },
    adminReply: { type: String },
    repliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
