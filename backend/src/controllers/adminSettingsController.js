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

// Get Public Settings
export async function getPublicStoreSettings(req, res) {
  try {
    const config = await AdminSettings.findOne();

    if (!config) {
      // Fallback if nothing is in the database
      return res.status(200).json({
        success: true,
        message: "Storefront settings retrieved successfully.",
        data: {
          storeName: "Hair Language",
          storeDescription: "",
          supportEmail: "info@hairlanguage.com",
          businessPhone: "+234 800 000 0000",
          openingHours: "",
          storeAddress: "",
          maintenanceMode: false,
          socials: { instagram: "", tiktok: "", facebook: "", whatsapp: "" },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Storefront settings retrieved successfully.",
      data: config.general,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve storefront settings.",
      error: error.message,
    });
  }
}

// Update General Settings
export async function updateGeneralSettings(req, res) {
  try {
    const {
      storeName,
      storeDescription,
      supportEmail,
      businessPhone,
      openingHours,
      storeAddress,
      maintenanceMode,
      socials,
    } = req.body;

    const updatedConfig = await AdminSettings.findOneAndUpdate(
      {},
      {
        $set: {
          "general.storeName": storeName,
          "general.storeDescription": storeDescription,
          "general.supportEmail": supportEmail,
          "general.businessPhone": businessPhone,
          "general.openingHours": openingHours,
          "general.storeAddress": storeAddress,
          "general.maintenanceMode": maintenanceMode,
          "general.socials": socials,
        },
      },
      { returnDocument: "after", upsert: true },
    );

    res.status(200).json({
      success: true,
      message: "General store configuration updated successfully.",
      data: updatedConfig.general,
    });
  } catch (error) {
    console.error("General Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to save general configurations.",
      error: error.message,
    });
  }
}
