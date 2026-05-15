import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCart,
} from "../controllers/cartController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

router.post("/add", optionalAuth, addToCart);
router.get("/get", optionalAuth, getCart);
router.patch("/update", optionalAuth, updateCart);
router.delete("/remove", optionalAuth, removeFromCart);
router.delete("/clear", optionalAuth, clearCart);

export default router;
