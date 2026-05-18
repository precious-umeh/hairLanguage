import express from "express";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  guestOrderLookup,
  removeOrder,
  softDeleteOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";

const router = express.Router();
// User Routes
router.get("/my-orders", authMiddleware, getUserOrders);
router.patch("/:id/hide", authMiddleware, softDeleteOrder);

// Public/Guest Route
router.post("/create-order", optionalAuth, createOrder);
router.post("/lookup", guestOrderLookup);
router.get("/:id", optionalAuth, getOrderById);

// Admin Routes
router.get("/admin/all", authMiddleware, adminMiddleWare, getAllOrders);
router.patch(
  "/admin/status/:id",
  authMiddleware,
  adminMiddleWare,
  updateOrderStatus,
);
router.delete(
  "/admin/remove/:id",
  authMiddleware,
  adminMiddleWare,
  removeOrder,
);

export default router;
