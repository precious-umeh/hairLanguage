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
server.use(cors());

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

connectDB();

export default server;
