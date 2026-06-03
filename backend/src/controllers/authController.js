import User from "../models/user.js";
import PendingUser from "../models/pendingUser.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
// import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import validator from "validator";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import {
  adminNewSignupTemplate,
  otpTemplate,
} from "../utils/emailTemplates.js";
import Consultation from "../models/consultation.js";
import Cart from "../models/cart.js";
import AdminSettings from "../models/adminSettings.js";

// dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const tokenTimeout = process.env.TOKEN_TIMEOUT;
const adminSecret = process.env.ADMIN_SECRET;

// generate auth token
const signToken = function (payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: tokenTimeout });
};

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required!",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const emailNormalized = email.toLowerCase().trim();
    const nameNormalized = name.trim();

    let avatar = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/user.png";

    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const otpExpirationTime = Date.now() + 10 * 60 * 1000;

    let pendingUser = await PendingUser.findOne({ email: emailNormalized });

    if (pendingUser) {
      // Update existing record (Resend Logic)
      pendingUser.name = nameNormalized;
      pendingUser.password = hashedPassword;
      pendingUser.avatar = avatar;
      pendingUser.otp = hashedOtp;
      pendingUser.otpExpiry = otpExpirationTime;
    } else {
      // Create brand new record
      pendingUser = new PendingUser({
        name: nameNormalized,
        email: emailNormalized,
        password: hashedPassword,
        avatar: avatar,
        otp: hashedOtp,
        otpExpiry: otpExpirationTime,
      });
    }

    await pendingUser.save();

    await sendEmail({
      to: emailNormalized,
      subject: "Hair Language | Verify Your Account",
      textContent: `Hello ${nameNormalized}, your verification code for Hair Language is: ${rawOtp}`,
      htmlContent: otpTemplate(nameNormalized, rawOtp),
    });

    res.status(200).json({
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.log(`REGISTRATION ERROR [${email}]:`, error);
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    // Find User in either pending or main user schema
    let account = await PendingUser.findOne({ email: emailNormalized });
    let isExistingUser = false;

    if (!account) {
      account = await User.findOne({
        $or: [
          { email: emailNormalized }, // User verifying original email
          { pendingEmail: emailNormalized }, // Existing user verifying a NEW email change
        ],
      });
      isExistingUser = true;
    }

    // If no account exists in either place return
    if (!account) {
      return res
        .status(404)
        .json({ message: "Verification session not found." });
    }

    // Validiate otp & otpExpiry
    if (!account.otp || !account.otpExpiry) {
      return res.status(400).json({ message: "OTP missing. Please resend." });
    }

    if (new Date(account.otpExpiry) < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    const isMatch = await bcrypt.compare(String(otp), account.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Finalize verification
    let verifiedUser;

    if (isExistingUser) {
      // Email update from update profile
      if (account.pendingEmail === emailNormalized) {
        account.email = account.pendingEmail;
        account.pendingEmail = null;
      }

      account.isVerified = true;
      account.otp = null;
      account.otpExpiry = null;
      await account.save();
      verifiedUser = account;
    } else {
      const alreadyExists = await User.findOne({ email: emailNormalized });
      if (alreadyExists) {
        await PendingUser.deleteOne({ email: emailNormalized });
        return res
          .status(400)
          .json({ message: "User already verified. Please login" });
      }

      verifiedUser = new User({
        name: account.name,
        email: account.email,
        password: account.password,
        avatar: account.avatar,
        role: "user",
        isVerified: true,
      });
    }

    await verifiedUser.save();
    await PendingUser.deleteOne({ email: emailNormalized });

    // Admin Notification Preference
    try {
      const systemConfig = await AdminSettings.findOne();
      const allowSignupAlerts = systemConfig
        ? systemConfig.notifications.newCustomerSignup
        : false;

      if (allowSignupAlerts) {
        await sendEmail({
          to: process.env.EMAIL_USER,
          subject: "New Client Registration - Hair Language",
          textContent: `${verifiedUser.name} (${verifiedUser.email}) has successfully verified their account.`,
          htmlContent: adminNewSignupTemplate(verifiedUser),
        });
      }
    } catch (configErr) {
      console.error("Admin registration alert failed safely:", configErr);
    }

    const token = signToken({
      sub: verifiedUser._id,
      email: verifiedUser.email,
      role: verifiedUser.role,
    });

    res.status(200).json({
      message: "Email verification successful.",
      token: token,
      user: {
        name: verifiedUser.name,
        email: verifiedUser.email,
        avatar: verifiedUser.avatar,
        role: verifiedUser.role,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}

export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    // find account in either collection
    let account = await PendingUser.findOne({ email: emailNormalized });

    if (!account) {
      account = await User.findOne({
        $or: [{ email: emailNormalized }, { pendingEmail: emailNormalized }],
      });
    }

    if (!account) {
      return res
        .status(404)
        .json({ message: "No account found associated with this email." });
    }

    // Rate Limiting Check
    // Check if the user is clicking "resend" too fast
    const canResendAt = new Date(account.updatedAt).getTime() + 120 * 1000;
    if (Date.now() < canResendAt) {
      return res.status(429).json({
        message: "Please wait two minutes before requesting another code.",
      });
    }

    // Generate and Hash New OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const otpExpirationTime = Date.now() + 10 * 60 * 1000;

    // Update account
    account.otp = hashedOtp;
    account.otpExpiry = otpExpirationTime;

    await account.save();

    await sendEmail({
      to: emailNormalized,
      subject: "Hair Language | Your New Verification Code",
      textContent: `Hello ${account.name}, your new code is: ${rawOtp}`,
      htmlContent: otpTemplate(account.name, rawOtp),
    });

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.log("OTP Resend Error:", error);
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password, requiredRole, otp, sessionId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // const matchedPassword = await bcrypt.compare(password, user.password);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (user.isVerified === false) {
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(rawOtp, 10);
      const otpExpirationTime = Date.now() + 10 * 60 * 1000;

      user.otp = hashedOtp;
      user.otpExpiry = otpExpirationTime;
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Hair Language | Verify Your Account",
        textContent: `Hello ${user.name} your verification code is ${rawOtp}`,
        htmlContent: otpTemplate(user.name, rawOtp),
      });

      return res.status(403).json({
        message:
          "Your account is not verified. Please check your email for the OTP.",
        needsVerification: true,
        email: user.email,
      });
    }

    if (
      requiredRole &&
      user.role.toLowerCase() !== requiredRole.toLowerCase()
    ) {
      return res.status(403).json({
        message: `Access denied. This account is not authorized as ${requiredRole}.`,
      });
    }

    // CART MERGE LOGIC
    if (sessionId) {
      // Find the guest cart and the user's existing cart
      const [guestCart, userCart] = await Promise.all([
        Cart.findOne({ sessionId }),
        Cart.findOne({ userId: user._id }),
      ]);

      if (guestCart && guestCart.items.length > 0) {
        if (!userCart) {
          // Scenario A: User has no cart. Convert guest cart to user cart.
          guestCart.userId = user._id;
          guestCart.sessionId = undefined; // Remove session association

          await guestCart.save();
        } else {
          // Scenario B: User already has items in their cart. Merge them.
          guestCart.items.forEach((guestItem) => {
            const existingItem = userCart.items.find(
              (item) =>
                item.productId.toString() === guestItem.productId.toString() &&
                item.selectedLength === guestItem.selectedLength &&
                item.selectedColor?.toString() ===
                  guestItem.selectedColor?.toString(),
            );

            if (existingItem) {
              // Update quantity if variation matches
              existingItem.quantity += guestItem.quantity;
            } else {
              // Add as new item variation
              userCart.items.push(guestItem);
            }
          });

          await userCart.save();
          // Delete the now-empty guest cart
          await Cart.deleteOne({ _id: guestCart._id });
        }
      }
    }

    await User.findByIdAndUpdate(user._id, { status: true });

    const token = signToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "User logged in",
      token: token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}

export async function registerAdmin(req, res) {
  try {
    const { name, email, password, adminKey } = req.body;

    if (!adminSecret) {
      return res.status(403).json({ message: "Admin registration disabled" });
    }

    if (adminKey !== adminSecret.trim()) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/user.png";

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: "admin",
      avatar: avatar,
    });

    await user.save();

    const token = signToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "Admin registration successful",
      token: token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to register admin", error: error.message });
  }
}

export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const sessionsData = {
      device: req.headers["user-agent"] || "Unknown Device",
      ip: req.ip || req.connection.remoteAddress,
      location: "Lagos, Lekki", // In production, use a geo-ip library here
    };

    // Capture the updated user to get the new session ID
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { activeSessions: { $each: [sessionsData], $slice: -5 } },
        status: true,
      },
      { returnDocument: "after" }, // This returns the user AFTER the push
    );

    // The most recent session is the last one in the array (due to $slice)
    const currentSessionId =
      updatedUser.activeSessions[updatedUser.activeSessions.length - 1]._id;

    // Support both legacy and current key names in case older data exists.
    const twofactor = user.twofactor;

    // Check if two factor authentication is enabled
    if (twofactor && twofactor.enabled) {
      return res.status(200).json({
        require2FA: true,
        userId: user._id,
        message: "Please enter your 2FA code to continue",
      });
    }

    const token = signToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Admin logged in",
      token: token,
      user: userResponse,
      currentSessionId: currentSessionId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing request",
      error: error.message,
    });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({ role: "user" })
      .select("_id email name role createdAt avatar status")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to retrieve users", error: error.message });
  }
}

export async function getUserProfile(req, res) {
  try {
    // req.user comes from authMiddleware
    const userId = req.user.id;
    const { email } = req.user;

    // Link guest bookings made with this email to the user account.
    await Consultation.updateMany(
      { contact: email, user: { $exists: false } },
      { $set: { user: userId } },
    );

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving profile",
      error: error.message,
    });
  }
}

export async function logout(req, res) {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $set: {
        status: false,
      },
    });

    res.clearCookie("token");

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Logout Error:", error);
    res.status(500).json({
      message: "Error logging out.",
      error: error.message,
    });
  }
}

export async function updateProfile(req, res) {
  try {
    // Define user id and get property fields from req.body
    const userId = req.user.id;
    const { name, email } = req.body;

    // Define user and check if its the correct user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle email logic
    let emailChanged = false;
    let newEmailNormalized = "";

    if (email && email.toLowerCase().trim() !== user.email) {
      newEmailNormalized = email.toLowerCase().trim();

      // Check if email is being used by another user
      const emailTaken = await User.findOne({ email: newEmailNormalized });
      if (emailTaken) {
        return res
          .status(409)
          .json({ message: "Email already in use by another account." });
      }

      emailChanged = true;
    }

    // Handle name and avatar update
    if (name) user.name = name.trim();
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    // If email changed, trigger otp verification
    if (emailChanged) {
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(rawOtp, 10);
      const otpExpirationTime = Date.now() + 10 * 60 * 1000;

      user.otp = hashedOtp;
      user.otpExpiry = otpExpirationTime;
      user.pendingEmail = newEmailNormalized;

      await user.save();

      await sendEmail({
        to: newEmailNormalized,
        subject: "Hair Language | Verify Your New Email",
        textContent: `Hello ${user.name}, your verification code for your new email is ${rawOtp}`,
        htmlContent: otpTemplate(user.name, rawOtp),
      });

      return res.status(200).json({
        message: "Profile updated. Please verify your new email address.",
        emailChangePending: true,
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    }

    // If no email change, save and return
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: userResponse });
  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({
      message: "Error updating profile.",
      error: error.message,
    });
  }
}

export async function cancelEmailUpdate(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.pendingEmail = null;

    await user.save();

    res.status(200).json({ message: "Email update cancelled." });
  } catch (error) {
    console.log("Email Cancellation Error:", error);
    res.status(500).json({
      message: "Error canceling email update.",
      error: error.message,
    });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const matchPassword = await bcrypt.compare(currentPassword, user.password);
    if (!matchPassword) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as the old one." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordLastChanged = Date.now();

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.log("Change Password Error:", error);
    res.status(500).json({
      message: "Error updating password.",
      error: error.message,
    });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });

    // For security, don't reveal if a user doesn't exist.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account is associated with this email. A verification code has been sent.",
      });
    }

    // Rate Limiting
    const canRequestAt = new Date(user.updatedAt).getTime() + 120 * 1000;
    if (Date.now() < canRequestAt) {
      return res.status(429).json({
        message: "Please wait two minutes before requesting another code.",
      });
    }

    // Generate OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const otpExpirationTime = Date.now() + 10 * 60 * 1000;

    // Save OTP to user model
    user.otp = hashedOtp;
    user.otpExpiry = otpExpirationTime;
    await user.save();

    // Send email
    await sendEmail({
      to: emailNormalized,
      subject: "Hair Language | Password Reset Code",
      textContent: `Your password reset code is: ${rawOtp}`,
      htmlContent: otpTemplate(user.name, rawOtp, "reset"),
    });

    res.status(200).json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });

    if (!user || !user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "Invalid request or OTP expired." });
    }

    // Check Expiry
    if (new Date(user.otpExpiry) < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(String(otp), user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password = hashedPassword;
    user.passwordLastChanged = Date.now();

    // Clear OTP fields
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      message:
        "Password reset successful. You can log in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({
      message: "Error resetting password.",
      error: error.message,
    });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await User.findByIdAndDelete(userId);

    await PendingUser.deleteOne({ email: user.email });

    res.clearCookie("token");

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.log("Deleting Account Error:", error);
    res.status(500).json({
      message: "Error deleting account.",
      error: error.message,
    });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("activeSessions");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Sessions fetched successfully.",
      sessions: user.activeSessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sessions.",
      error: error.message,
    });
  }
}

export async function deleteSession(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { activeSessions: { _id: sessionId } },
    });

    res.status(200).json({ success: true, message: "Signed out of session" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing session",
      error: error.message,
    });
  }
}

export async function setup2FA(req, res) {
  try {
    const userId = req.user.id;

    // Generate a unique secret for this user
    const secret = speakeasy.generateSecret({
      name: `Hair Language Admin (${req.user.email})`,
    });

    // Save to tempSecret in DB
    await User.findByIdAndUpdate(userId, {
      "twofactor.tempSecret": secret.base32,
    });

    // Convert the secret to a QR code image (data URL)
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Send the QR code and raw secret to the frontend
    res.status(200).json({
      message: "2FA setup successful",
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error setting up 2FA",
      error: error.message,
    });
  }
}

export async function verifyAndEnable2FA(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.twofactor.tempSecret) {
      return res.status(404).json({ message: "2FA setup not initated." });
    }

    // Verify the 6-digit code against the temporary secret
    const isVerified = speakeasy.totp.verify({
      secret: user.twofactor.tempSecret,
      encoding: "base32",
      token: code,
      window: 1, // Allows 1 period (30s) before/after for sync issues
    });

    if (!isVerified) {
      return res
        .status(400)
        .json({ message: "Invalid 6-digit code. Try again." });
    }

    // Promote tempSecret to permanent secret and clear temp
    user.twofactor.enabled = true;
    user.twofactor.secret = user.twofactor.tempSecret;
    user.twofactor.tempSecret = null;
    user.twofactor.lastUpdated = Date.now();

    await user.save();

    res.status(200).json({
      message: "2FA enabled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying 2FA",
      error: error.message,
    });
  }
}

export async function finalize2FALogin(req, res) {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const twofactor = user.twofactor;

    if (!twofactor?.enabled || !twofactor?.secret) {
      return res
        .status(400)
        .json({ message: "2FA is not enabled for this user." });
    }

    const isVerified = speakeasy.totp.verify({
      secret: twofactor.secret,
      encoding: "base32",
      token: code,
      window: 1, // Allows 1 period (30s) before/after for sync issues
    });

    if (!isVerified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    const sessionsData = {
      device: req.headers["user-agent"] || "Unknown Device",
      ip: req.ip || req.connection.remoteAddress,
      location: "Lagos, Lekki",
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { activeSessions: { $each: [sessionsData], $slice: -5 } },
        status: true,
      },
      { returnDocument: "after" },
    );

    const currentSessionId =
      updatedUser.activeSessions[updatedUser.activeSessions.length - 1]._id;

    const token = signToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.twofactor;

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userResponse,
      currentSessionId: currentSessionId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message,
    });
  }
}

export async function disable2FA(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.twofactor.enabled = false;
    user.twofactor.secret = null;
    user.twofactor.tempSecret = null;
    user.twofactor.lastUpdated = Date.now();

    await user.save();

    res.status(200).json({
      message: "Two-Factor Authentication has been disabled.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error disabling 2FA",
      error: error.message,
    });
  }
}

/*
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    const pendingUser = await PendingUser.findOne({ email: emailNormalized });

    if (!pendingUser) {
      return res
        .status(404)
        .json({ message: "Verification session not found." });
    }

    if (!pendingUser.otp || !pendingUser.otpExpiry) {
      return res.status(400).json({ message: "OTP missing. Please resend." });
    }

    if (pendingUser.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    const isMatch = await bcrypt.compare(String(otp), pendingUser.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check one last time before creating the user
    // to prevent "Duplicate Key" errors if they clicked verify twice quickly
    const userExists = await User.findOne({ email: emailNormalized });
    if (userExists) {
      await PendingUser.deleteOne({ email: emailNormalized });
      return res
        .status(400)
        .json({ message: "User is already verified. Please login." });
    }

    const user = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      avatar: pendingUser.avatar,
      role: "user",
      isVerified: true,
    });

    await user.save();
    await PendingUser.deleteOne({ email: emailNormalized });

    const token = signToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: "Email verification successful.",
      token: token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}


export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    const pendingUser = await PendingUser.findOne({ email: emailNormalized });

    if (!pendingUser) {
      return res
        .status(404)
        .json({ message: "No pending user account found." });
    }

    // Check if the user is clicking "resend" too fast
    const canResendAt = new Date(pendingUser.updatedAt).getTime() + 120 * 1000;
    if (Date.now() < canResendAt) {
      return res.status(429).json({
        message: "Please wait two minutes before requesting another code.",
      });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const otpExpirationTime = Date.now() + 10 * 60 * 1000;

    pendingUser.otp = hashedOtp;
    pendingUser.otpExpiry = otpExpirationTime;

    await pendingUser.save();

    await sendEmail({
      to: emailNormalized,
      subject: "Hair Language | Your New Verification Code",
      textContent: `Hello ${pendingUser.name}, your new code is: ${rawOtp}`,
      htmlContent: otpTemplate(pendingUser.name, rawOtp),
    });

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.log("OTP Resend Error:", error);
    res.status(500).json({
      message: "Error processing request.",
      error: error.message,
    });
  }
}

export async function verifyAndEnable2FA(req, res) {
  try {
    const userId = req.user.id;
    const { code, tempSecret } = req.body;

    // Verify the 6-digit code against the temporary secret
    const isVerified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token: code,
      window: 1, // Allows 1 period (30s) before/after for sync issues
    });

    if (!isVerified) {
      return res
        .status(400)
        .json({ message: "Invalid 6-digit code. Try again." });
    }

    // If verified, save to database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.twofactor = {
      enabled: true,
      secret: tempSecret,
    };

    await user.save();

    res.status(200).json({
      message: "2FA enabled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying 2FA",
      error: error.message,
    });
  }
}
*/
