import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactMessageRoutes from "./routes/contactMessageRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import colorRoutes from "./routes/colorRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";

const server = express();
server.use(express.json());

const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

server.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (Postman, mobile apps) with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // only if you use cookies; you use Bearer tokens mostly
  }),
);

server.use("/api", productRoutes);
server.use("/api", consultationRoutes);
server.use("/auth", authRoutes);
server.use("/api", contactMessageRoutes);
server.use("/api", newsletterRoutes);
server.use("/api", colorRoutes);
server.use("/api/cart", cartRoutes);
server.use("/api/orders", orderRoutes);
server.use("/api/transactions", transactionRoutes);
server.use("/api/admin", adminRoutes);
server.use("/api/admin", adminSettingsRoutes);

// Health Check Route to stop render from shutting down every 15mins
server.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

connectDB();

export default server;
