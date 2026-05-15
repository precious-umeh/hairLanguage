import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  message: { type: String },
  texture: { type: [String], default: [] },
  occasion: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["pending", "contacted", "archived"],
    default: "pending",
    lowercase: true,
  },
  previousStatus: { type: String },
  createdAt: { type: Date, default: Date.now },
  adminReply: { type: String },
  repliedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedByUser: { type: Boolean, default: false },
});

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
