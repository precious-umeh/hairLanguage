import AdminSettings from "../models/adminSettings.js";

// Fetch Current Dashboard Preferences
export async function getAdminSettings(req, res) {
  try {
    let settings = await AdminSettings.findOne();

    if (!settings) {
      // Seed fallback initialization settings if empty
      settings = await AdminSettings.create({});
    }

    res.status(200).json({
      success: true,
      message: "Admin settings retrieved successfully.",
      data: settings.notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve admin settings.",
      error: error.message,
    });
  }
}

// Update Admin Preferences
export async function updateAdminSettings(req, res) {
  try {
    const updatedPreferences = req.body;

    const settings = await AdminSettings.findOneAndUpdate(
      {},
      { $set: { notifications: updatedPreferences } },
      { returnDocument: "after", upsert: true },
    );

    res.status(200).json({
      success: true,
      message: "Preference synchronized securely.",
      data: settings.notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update admin settings preference.",
      error: error.message,
    });
  }
}
