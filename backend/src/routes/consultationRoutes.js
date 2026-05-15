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

const router = express.Router();

router.post("/consultations", emailLimiter, sendBookings);
router.get("/consultations", receiveBookings);
router.get("/my-consultations", authMiddleware, getMyBookings);
router.post("/consultations/:id/reply", replyToBooking);
router.patch("/consultations/:id", updateBookingStatus);
router.patch("/my-consultations/:id/hide", authMiddleware, softDeleteBooking);
router.delete("/consultations/:id", deleteBookings);

export default router;
