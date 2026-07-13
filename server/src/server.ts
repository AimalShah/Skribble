import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { setupSocket } from "./socket/socketHandlers";
import { setupCommandLine } from "./utils/commandline";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import roomsRoutes from "./routes/rooms";
import statsRoutes from "./routes/stats";
import { configDotenv } from "dotenv";

configDotenv();

export async function createApp() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/rooms", roomsRoutes);
  app.use("/api/stats", statsRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/skribble";
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  // Socket.IO
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  setupSocket(io);
  setupCommandLine(io);

  return { app, server, io };
}

// Start server if run directly
if (require.main === module) {
  createApp().then(({ server }) => {
    server.listen(8000, function() {
      console.log("listening on *:8000");
    });
  });
}
