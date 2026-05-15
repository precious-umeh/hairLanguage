import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";
import {
  getAllTransactions,
  getUserTransactions,
  initializePayment,
  verifyPayment,
} from "../controllers/transactionController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

router.post("/initialize", optionalAuth, initializePayment);
router.get("/verify/:reference", verifyPayment);

router.get("/admin/all", authMiddleware, adminMiddleWare, getAllTransactions);
router.get("/my-history", authMiddleware, getUserTransactions);

// router.get("/all", authMiddleware, adminMiddleWare, getAllTransactions);
// router.get("/user/:userId", authMiddleware, getUserTransaction);

export default router;
