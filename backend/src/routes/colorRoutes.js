import express from "express";
import {
  createColor,
  deleteColor,
  getColors,
  updateColors,
} from "../controllers/colorController.js";

const router = express.Router();

router.post("/colors", createColor);
router.get("/colors", getColors);
router.patch("/colors/:id", updateColors);
router.delete("/colors/:id", deleteColor);

export default router;
