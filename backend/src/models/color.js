import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hex: { type: String, required: true },
  type: { type: String, default: "Solid" },
});

const Color = mongoose.model("Color", colorSchema);

export default Color;
