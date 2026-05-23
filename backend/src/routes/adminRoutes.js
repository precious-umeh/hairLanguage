import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  authMiddleware,
  adminMiddleWare,
  getDashboardStats,
);

export default router;
