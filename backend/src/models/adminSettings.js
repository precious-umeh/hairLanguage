import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    // Evaluates env variable, but falls back safely if the env isn't loaded yet
    adminEmail: {
      type: String,
      default: () =>
        process.env.EMAIL_USER || "preciouschukwuanugoumeh@gmail.com",
    },
    notifications: {
      newOrderAlerts: { type: Boolean, default: true },
      orderCancellations: { type: Boolean, default: true },
      lowStockWarning: { type: Boolean, default: true },
      outOfStock: { type: Boolean, default: false },
      newCustomerSignup: { type: Boolean, default: false },
      payoutConfirmations: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

const AdminSettings =
  mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", adminSettingsSchema);
export default AdminSettings;
