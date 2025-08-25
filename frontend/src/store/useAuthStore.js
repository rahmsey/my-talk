import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const BASE_URL =   import.meta.env.MODE ==="development"  ?   "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ Check auth
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully 🎉");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed ❌");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully 🎉");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed ❌");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout", {}, {
        validateStatus: () => true,
        withCredentials: true,
      });

      if (res.status === 200 || res.status === 401) {
        set({ authUser: null });
        useChatStore.getState().resetChat();
        toast.success("Logged out successfully ✅");
        get().disconnectSocket();
      } else {
        toast.error(`Logout failed ❌ (${res.status})`);
      }
    } catch (error) {
      console.error("Unexpected logout error:", error);
    }
  },

  // ✅ Update profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user || res.data });
      toast.success(res.data.message || "Profile updated ✅");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed ❌");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Socket connection (ONLY online users here)
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    // Listen for online users only
    newSocket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
  },
}));
