import "./src/config/env.js";
import server from "./src/server.js";
import express from "express";
// import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { env } from "./src/config/env.js";

// dotenv.config();

const port = process.env.PORT || 5500;
const filename = fileURLToPath(import.meta.url);
const directoryName = path.dirname(filename);

server.use("/uploads", express.static(path.join(directoryName, "uploads")));

server.listen(env.port, () =>
  // console.log(`Server running at http://127.0.0.1:${port}`),
  console.log(`Server running on port ${env.port}`),
);
