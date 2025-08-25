import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Maps to track online users
const userSocketMap = {};   // { userId: socketId }
const socketUserMap = {};   // { socketId: userId }

let ioInstance; // Will be initialized in initializeSocket

/**
 * Initialize Socket.IO with the given server
 */
export const initializeSocket = () => {
  if (ioInstance) return ioInstance; // Prevent double initialization

  ioInstance = new Server(server, {
    cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] },
  });

  ioInstance.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      socketUserMap[socket.id] = userId;
    }

    // Send updated online users list to all clients
    ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));

    /**
     * Listen for new messages from clients
     * message should include: { senderId, receiverId, text, ... }
     */
    socket.on("sendMessage", (message) => {
      console.log("📩 Message received on server:", message);

      const receiverSocketId = getReceiverSocketId(message.receiverId);

      if (receiverSocketId) {
        // Send to receiver
        ioInstance.to(receiverSocketId).emit("newMessage", message);
      }

      // Always send back to sender so they see it instantly
      ioInstance.to(socket.id).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      const disconnectedUserId = socketUserMap[socket.id];
      if (disconnectedUserId) {
        delete userSocketMap[disconnectedUserId];
        delete socketUserMap[socket.id];
      }
      console.log("A user disconnected:", socket.id);
      ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return ioInstance;
};

/**
 * Safely get the Socket.IO instance after initialization
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized! Call initializeSocket() first.");
  }
  return ioInstance;
};

/**
 * Get the socket ID of a specific user
 */
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { app, server };
