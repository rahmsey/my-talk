import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // 👉 helper to safely add a new message
  addMessage: (newMessage) => {
    set((state) => {
      const exists = state.messages.some((m) => m._id === newMessage._id);
      if (exists) return state;
      return { messages: [...state.messages, newMessage] };
    });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // update local state immediately
      get().addMessage(res.data);

      // emit to socket for real-time
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("sendMessage", {
          ...res.data,
          receiverId: selectedUser._id, // make sure backend knows who gets it
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },













  
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // 🔑 clear old listener before re-attaching
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const { authUser } = useAuthStore.getState();

      // only add messages that belong to the active chat
      const isRelevant =
        (newMessage.senderId === selectedUser?._id &&
          newMessage.receiverId === authUser._id) ||
        (newMessage.receiverId === selectedUser?._id &&
          newMessage.senderId === authUser._id);

      if (isRelevant) {
        get().addMessage(newMessage);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
