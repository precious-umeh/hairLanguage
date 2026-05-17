import express from "express";
import {
  cancelEmailUpdate,
  changePassword,
  deleteAccount,
  deleteSession,
  disable2FA,
  finalize2FALogin,
  forgotPassword,
  getActiveSessions,
  getAllUsers,
  getUserProfile,
  login,
  loginAdmin,
  logout,
  register,
  registerAdmin,
  resendOtp,
  resetPassword,
  setup2FA,
  updateProfile,
  verifyAndEnable2FA,
  verifyOtp,
} from "../controllers/authController.js";
import upload from "../middlewares/file-upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { emailLimiter } from "../middlewares/emailRateLimiter.js";
import adminMiddleWare from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), emailLimiter, register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", emailLimiter, resendOtp);
router.post("/login", emailLimiter, login);
router.post("/register-admin", upload.single("avatar"), registerAdmin);
router.post("/login-admin", loginAdmin);
router.post("/logout", authMiddleware, logout);
router.post("/cancel-email-update", authMiddleware, cancelEmailUpdate);
router.post("/2fa/verify", authMiddleware, verifyAndEnable2FA);
router.post("/2fa/verify-login", finalize2FALogin);
router.post("/2fa/disable", authMiddleware, disable2FA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/get-users", authMiddleware, adminMiddleWare, getAllUsers);
router.get("/me", authMiddleware, getUserProfile);
router.get("/get-sessions", authMiddleware, getActiveSessions);
router.get("/2fa/setup", authMiddleware, setup2FA);

router.patch(
  "/update-profile",
  authMiddleware,
  upload.single("avatar"),
  updateProfile,
);
router.patch("/change-password", authMiddleware, changePassword);

router.delete("/delete-account", authMiddleware, deleteAccount);
router.delete("/delete-session/:sessionId", authMiddleware, deleteSession);

export default router;
