import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // Link to the Order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    // For Guests, it's null, for users, it's their ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paystackId: { type: Number }, // The ID returned from Paystack API
    channel: { type: String }, // e.g. "card", "bank-transfer"
    paidAt: { type: Date },
    // A log for the full Paystack response in case of disputes
    metadata: { type: Object },
  },
  { timestamps: true },
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;

// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema({
//   status: { type: String, required: true },
//   id: { type: Number, required: true },
//   reference: { type: String, required: true },
//   amount: { type: Number, required: true },
//   time: { type: String },
//   product: { type: Object, required: true },
//   history: { type: [Object] },
//   userId: { type: String },
//   email: { type: String, required: true },
// });

// const Transaction =
//   mongoose.models.Transaction ||
//   mongoose.model("Transaction", transactionSchema);

// export default Transaction;
