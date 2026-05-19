import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Optional for guests, required for logged in users
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    email: { type: String, required: true },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        size: { type: Number },
        colorName: { type: String },
        colorId: { type: mongoose.Schema.Types.ObjectId, ref: "Color" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "cancelled", "delivered"],
      default: "pending",
    },
    shippingAddress: {
      address: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentReference: { type: String, unique: true, sparse: true },
    deletedByUser: { type: Boolean, default: false },
    deletedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
