import express from "express";
import {
  createMessage,
  deleteMessage,
  getMessages,
  replyToMessage,
  updateMessageStatus,
} from "../controllers/contactMessageController.js";
import { emailLimiter } from "../middlewares/emailRateLimiter.js";

const router = express.Router();

router.post("/contact", emailLimiter, createMessage);
router.get("/contact", getMessages);
router.post("/contact/:id/reply", replyToMessage);
router.patch("/contact/:id", updateMessageStatus);
router.delete("/contact/:id", deleteMessage);

export default router;
