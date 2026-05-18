import express from "express";
import {
  deleteBookings,
  getMyBookings,
  receiveBookings,
  replyToBooking,
  sendBookings,
  softDeleteBooking,
  updateBookingStatus,
} from "../controllers/consultationController.js";
import { emailLimiter } from "../middlewares/emailRateLimiter.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/consultations", emailLimiter, sendBookings);
router.get("/consultations", authMiddleware, adminMiddleWare, receiveBookings);
router.get("/my-consultations", authMiddleware, getMyBookings);
router.post(
  "/consultations/:id/reply",
  authMiddleware,
  adminMiddleWare,
  replyToBooking,
);
router.patch(
  "/consultations/:id",
  authMiddleware,
  adminMiddleWare,
  updateBookingStatus,
);
router.patch("/my-consultations/:id/hide", authMiddleware, softDeleteBooking);
router.delete(
  "/consultations/:id",
  authMiddleware,
  adminMiddleWare,
  deleteBookings,
);

export default router;
