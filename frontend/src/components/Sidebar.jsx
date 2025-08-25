import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { io } from "socket.io-client";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { authUser } = useAuthStore();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Connect to socket
  useEffect(() => {
    if (!authUser?._id) return;

    const socket = io("http://localhost:5001", {
      query: { userId: authUser._id.toString() },
    });

    socket.on("getOnlineUsers", (users) => {
      // Normalize all ids to string
      const normalized = users.map((id) => id?.toString());
      setOnlineUsers(normalized);
      console.log("📡 Online users from socket:", normalized);
    });

    return () => {
      socket.disconnect();
    };
  }, [authUser?._id]);

   const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)) : users;
 


  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Contacts Header */}
      <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
        <Users size={20} className="text-zinc-400" />
        <h2 className="text-base font-semibold text-zinc-200 hidden lg:block">
          Contacts
        </h2>
      </div>


     
      {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      





      {/* Contacts List */}
      <div className="overflow-y-auto w-full">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user?._id?.toString());

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full border border-base-300"
                />
                {/* Online indicator */}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-base-300 rounded-full"></span>
                )}
              </div>

              {/* User info */}
              <div className="hidden lg:flex flex-col text-left min-w-0">
                <span className="font-medium truncate text-zinc-200">
                  {user.fullName}
                </span>
                <span
                  className={`text-sm ${
                    isOnline ? "text-green-500" : "text-zinc-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;