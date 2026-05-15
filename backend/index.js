import server from "./src/server.js";
import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const port = process.env.PORT || 5500;
const filename = fileURLToPath(import.meta.url);
const directoryName = path.dirname(filename);

server.use("/uploads", express.static(path.join(directoryName, "uploads")));

server.listen(port, () =>
  console.log(`Server running at http://127.0.0.1:${port}`),
);
