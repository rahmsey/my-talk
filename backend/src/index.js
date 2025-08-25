import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server, initializeSocket } from "./lib/socket.js";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";



dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ----------------------
// Initialize Socket.IO
// ----------------------
initializeSocket(); // Must be called BEFORE routes/controllers

// ----------------------
// Middleware
// ----------------------
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:  process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));


  app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ----------------------
// Start server & connect to DB
// ----------------------
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
  connectDB();
});

// ----------------------
// Handle server errors
// ----------------------
server.on("error", (err) => {
  console.error("Server failed to start:", err.message);
  process.exit(1); // optional: exit if server cannot start
});