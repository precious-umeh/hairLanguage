import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGO_URL",
  "JWT_SECRET",
  "TOKEN_TIMEOUT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "PAYSTACK_SECRET_KEY",
  "FRONTEND_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  missing.forEach((key) => console.error(` - ${key}`));
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 5500,
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  tokenTimeout: process.env.TOKEN_TIMEOUT,
  adminSecret: process.env.ADMIN_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  frontendUrl: process.env.FRONTEND_URL.replace(/\/$/, ""),
  adminUrL: process.env.ADMIN_URL,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
