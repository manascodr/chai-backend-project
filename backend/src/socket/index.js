import { Server } from "socket.io";

// In-memory store for active watch party rooms
// Structure:
// rooms.get(roomId) => {
//   videoId: string,
//   hostId: string,
//   playback: {
//     isPlaying: boolean,
//     currentTime: number,
//     updatedAt: number // timestamp in ms
//   },
//   users: Map<socketId, { _id, username, avatar, fullName }>
// }
const rooms = new Map();

export const initializeSocket = (httpServer) => {
  const allowedOrigins = [
    "http://localhost:5173",
    ...(process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""))
      : []),
  ];

  const io = new Server(httpServer, { // Initialize socket.io with the HTTP server
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, "");
        if (
          allowedOrigins.includes(normalized) ||
          normalized.endsWith(".vercel.app") ||
          process.env.NODE_ENV !== "production"
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    // 1. JOIN ROOM
    socket.on("JOIN_ROOM", ({ roomId, videoId, user }) => {
      currentRoomId = roomId;
      currentUser = user;

      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          videoId,
          hostId: user?._id || socket.id,
          playback: {
            isPlaying: false,
            currentTime: 0,
            updatedAt: Date.now(),
          },
          users: new Map(),
        });
      }

      const room = rooms.get(roomId);
      room.users.set(socket.id, {
        socketId: socket.id,
        _id: user?._id || socket.id,
        username: user?.username || "Guest",
        avatar: user?.avatar || "",
        fullName: user?.fullName || "Guest User",
      });

      // Send initial room state to the newly joined user
      const usersList = Array.from(room.users.values());
      socket.emit("ROOM_STATE", {
        roomId,
        videoId: room.videoId,
        hostId: room.hostId,
        playback: room.playback,
        users: usersList,
      });

      // Notify other members in the room that a user joined
      socket.to(roomId).emit("USER_JOINED", {
        user: room.users.get(socket.id),
        users: usersList,
      });

      // Broadcast system chat message
      io.to(roomId).emit("RECEIVE_MESSAGE", {
        id: "sys_" + Date.now(),
        isSystem: true,
        text: `${user?.username || "A user"} joined the party`,
        timestamp: Date.now(),
      });
    });

    // 2. SYNC PLAYBACK ACTION (PLAY / PAUSE / SEEK)
    socket.on("SYNC_ACTION", ({ roomId, action, currentTime }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const serverTimestamp = Date.now();

      // Update room state
      room.playback = {
        isPlaying: action === "PLAY",
        currentTime,
        updatedAt: serverTimestamp,
      };

      // Forward to everyone in the room except sender
      socket.to(roomId).emit("SYNC_ACTION", {
        action,
        currentTime,
        serverTimestamp,
        byUser: currentUser?.username || "Member",
      });
    });

    // 3. SEND CHAT MESSAGE
    socket.on("SEND_MESSAGE", ({ roomId, message }) => {
      if (!message || !message.trim()) return;

      const chatPayload = {
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        user: currentUser,
        text: message.trim(),
        timestamp: Date.now(),
      };

      io.to(roomId).emit("RECEIVE_MESSAGE", chatPayload);
    });

    // 4. CLEANUP ON DISCONNECT / LEAVE
    const handleLeave = () => {
      if (!currentRoomId || !rooms.has(currentRoomId)) return;

      const room = rooms.get(currentRoomId);
      const departingUser = room.users.get(socket.id);
      room.users.delete(socket.id);

      socket.leave(currentRoomId);

      if (room.users.size === 0) {
        // Delete room from memory if no one is left
        rooms.delete(currentRoomId);
      } else {
        // If the host leaves, transfer host to next connected user
        if (room.hostId === departingUser?._id || room.hostId === socket.id) {
          const nextUser = room.users.values().next().value;
          if (nextUser) {
            room.hostId = nextUser._id;
            io.to(currentRoomId).emit("HOST_CHANGED", { hostId: room.hostId });
          }
        }

        const usersList = Array.from(room.users.values());
        socket.to(currentRoomId).emit("USER_LEFT", {
          user: departingUser,
          users: usersList,
        });

        io.to(currentRoomId).emit("RECEIVE_MESSAGE", {
          id: "sys_" + Date.now(),
          isSystem: true,
          text: `${departingUser?.username || "A user"} left the party`,
          timestamp: Date.now(),
        });
      }
    };

    socket.on("LEAVE_ROOM", handleLeave);
    socket.on("disconnect", handleLeave);
  });

  return io;
};

