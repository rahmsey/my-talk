import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { ArrowLeft, MoreVertical, X } from "lucide-react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore();

  const [onlineUsers, setOnlineUsers] = useState([]);

  // Connect to socket
  useEffect(() => {
    if (!authUser?._id) return;

    const socket = io("http://localhost:5001", {
      query: { userId: authUser._id.toString() },
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users.map((id) => id?.toString()));
    });

    return () => {
      socket.disconnect();
    };
  }, [authUser?._id]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-12 border-b border-base-300 bg-base-100">
        <p className="text-sm opacity-70">Select a chat to start messaging</p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser?._id?.toString());

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-base-300 bg-base-100">
      {/* Back button (mobile only) */}
      <button
        className="md:hidden mr-2 btn btn-ghost btn-circle"
        onClick={() => setSelectedUser(null)}
      >
        <ArrowLeft size={20} />
      </button>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1">
        <img
          src={selectedUser.profilePic || "/default-avatar.png"}
          alt={selectedUser.fullName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-sm">{selectedUser.fullName}</h2>
          <p className="text-xs opacity-70">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="btn btn-ghost btn-circle">
          <MoreVertical size={20} />
        </button>
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setSelectedUser(null)}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;