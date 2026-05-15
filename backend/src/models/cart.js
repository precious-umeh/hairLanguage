import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    sessionId: {
      type: String,
      index: true,
    },

    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        selectedColor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
        selectedLength: { type: Number },
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity cannot be less than 1"],
        },
      },
    ],
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true },
);

cartSchema.pre("validate", function () {
  if (!this.userId && !this.sessionId) {
    throw new Error("A cart must belong to a user or a guest session.");
  }
});

cartSchema.pre("save", function () {
  this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
  this.totalPrice = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;

// import mongoose from "mongoose";

// const cartSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         // Track specific choices for the wig
//         selectedColor: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Color",
//         },
//         selectedLength: { type: Number },

//         productName: { type: String, required: true },
//         price: { type: Number, required: true }, // The price based on length/color
//         image: { type: String }, // Just the main selected image
//         quantity: {
//           type: Number,
//           default: 1,
//           min: [1, "Quantity cannot be less than 1"],
//         },
//       },
//     ],
//     // 'total' usually refers to item count, 'totalPrice' to the money
//     totalItems: { type: Number, default: 0 },
//     totalPrice: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// );

// // Optional: Add a pre-save hook to calculate totals automatically
// cartSchema.pre("save", function (next) {
//   this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
//   this.totalPrice = this.items.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0,
//   );
//   next();
// });

// const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
// export default Cart;
