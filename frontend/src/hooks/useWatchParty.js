import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://vivid-stream.onrender.com");

export const useWatchParty = ({ roomId, videoId, currentUser }) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteAction, setRemoteAction] = useState(null);
  const [initialPlayback, setInitialPlayback] = useState(null);

  useEffect(() => {
    if (!roomId || !currentUser) return;

    // 1. Establish socket connection
    const socket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Join Room
      socket.emit("JOIN_ROOM", {
        roomId,
        videoId,
        user: {
          _id: currentUser._id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          fullName: currentUser.fullName,
        },
      });
    });

    // 2. Initial Room State
    socket.on("ROOM_STATE", (data) => {
      setHostId(data.hostId);
      setUsers(data.users || []);
      if (data.playback) {
        setInitialPlayback(data.playback);
      }
    });

    // 3. User join/leave events
    socket.on("USER_JOINED", ({ users }) => {
      setUsers(users);
    });

    socket.on("USER_LEFT", ({ users }) => {
      setUsers(users);
    });

    socket.on("HOST_CHANGED", ({ hostId }) => {
      setHostId(hostId);
    });

    // 4. Remote Sync Action (Play/Pause/Seek)
    socket.on("SYNC_ACTION", (data) => {
      setRemoteAction(data);
    });

    // 5. Incoming Chat Message
    socket.on("RECEIVE_MESSAGE", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Cleanup on component unmount
    return () => {
      socket.emit("LEAVE_ROOM");
      socket.disconnect();
    };
  }, [roomId, videoId, currentUser]);

  // Method to send sync actions to peers
  const sendSyncAction = useCallback(
    (action, currentTime) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("SYNC_ACTION", {
          roomId,
          action,
          currentTime,
        });
      }
    },
    [roomId, isConnected]
  );

  // Method to send chat messages
  const sendMessage = useCallback(
    (text) => {
      if (socketRef.current && isConnected && text.trim()) {
        socketRef.current.emit("SEND_MESSAGE", {
          roomId,
          message: text,
        });
      }
    },
    [roomId, isConnected]
  );

  return {
    isConnected,
    messages,
    users,
    hostId,
    remoteAction,
    initialPlayback,
    sendSyncAction,
    sendMessage,
    isHost: hostId === currentUser?._id,
  };
};

