import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";
import {
  getAdminSettings,
  getPublicStoreSettings,
  updateAdminSettings,
  updateGeneralSettings,
} from "../controllers/adminSettingsController.js";

const router = express.Router();

router.get(
  "/settings/notifications/get",
  authMiddleware,
  adminMiddleWare,
  getAdminSettings,
);

router.get("/settings/general/public", getPublicStoreSettings);

router.patch(
  "/settings/notifications/update",
  authMiddleware,
  adminMiddleWare,
  updateAdminSettings,
);

router.patch(
  "/settings/general/update",
  authMiddleware,
  adminMiddleWare,
  updateGeneralSettings,
);

export default router;
