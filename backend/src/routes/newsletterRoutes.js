import express from "express";
import {
  getSubscribers,
  removeSubscriber,
  subscribe,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/newsletter", subscribe);
router.get("/newsletter", getSubscribers);
router.delete("/newsletter/:id", removeSubscriber);

export default router;
