import express from "express";
import {
  addProduct,
  deleteProduct,
  getOneProduct,
  getOneProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import upload from "../middlewares/file-upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/slug/:slug", getOneProductBySlug);
router.get("/products/:id", getOneProduct);
router.post(
  "/products",
  authMiddleware,
  adminMiddleWare,
  upload.array("images", 10),
  addProduct,
);
router.patch(
  "/products/:id",
  authMiddleware,
  adminMiddleWare,
  upload.array("images", 10),
  updateProduct,
);
router.delete("/products/:id", authMiddleware, adminMiddleWare, deleteProduct);

export default router;
