import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    // Evaluates env variable, but falls back safely if the env isn't loaded yet
    adminEmail: {
      type: String,
      default: () =>
        process.env.EMAIL_USER || "preciouschukwuanugoumeh@gmail.com",
    },
    general: {
      storeName: { type: String, default: "Hair Language" },
      storeDescription: { type: String, default: "" },
      supportEmail: { type: String, default: "info@hairlanguage.com" },
      businessPhone: { type: String, default: "+234 800 000 0000" },
      openingHours: { type: String, default: "" },
      storeAddress: { type: String, default: "" },
      maintenanceMode: { type: Boolean, default: false },
      socials: {
        instagram: { type: String, default: "" },
        tiktok: { type: String, default: "" },
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
      },
    },
    notifications: {
      newOrderAlerts: { type: Boolean, default: true },
      // orderCancellations: { type: Boolean, default: true },
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
