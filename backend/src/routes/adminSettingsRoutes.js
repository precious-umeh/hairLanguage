import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/adminSettingsController.js";

const router = express.Router();

router.get(
  "/settings/notifications/get",
  authMiddleware,
  adminMiddleWare,
  getAdminSettings,
);

router.patch(
  "/settings/notifications/update",
  authMiddleware,
  adminMiddleWare,
  updateAdminSettings,
);

export default router;
