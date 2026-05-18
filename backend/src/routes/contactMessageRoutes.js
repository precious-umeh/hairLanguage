import express from "express";
import {
  createMessage,
  deleteMessage,
  getMessages,
  replyToMessage,
  updateMessageStatus,
} from "../controllers/contactMessageController.js";
import { emailLimiter } from "../middlewares/emailRateLimiter.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/contact", emailLimiter, createMessage);
router.get("/contact", authMiddleware, adminMiddleWare, getMessages);
router.post(
  "/contact/:id/reply",
  authMiddleware,
  adminMiddleWare,
  replyToMessage,
);
router.patch(
  "/contact/:id",
  authMiddleware,
  adminMiddleWare,
  updateMessageStatus,
);
router.delete("/contact/:id", authMiddleware, adminMiddleWare, deleteMessage);

export default router;
