// src/context/SocketContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";
import { Message } from "../types/message";
import { secureStorage } from "../utils/secureStorage";
import { useChat } from "./ChatContext";
import { useMessage } from "./MessageContext";

// Define context type
interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isConnected: boolean;
  connectionError: string | null;
  sendTypingStatus: (chatId: string, isTyping: boolean) => void;
  userTyping: { userId: string; chatId: string } | null;
  joinChat: (chatId: string) => void;
  reconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userTyping, setUserTyping] = useState<{
    userId: string;
    chatId: string;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [setupAttempts, setSetupAttempts] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);

  const { receiveMessage } = useMessage();
  const { state: chatState } = useChat();

  // Helper function to get user data with better error handling
  const getUserData = async (): Promise<{
    token: string;
    userId: string;
  } | null> => {
    try {
      console.log("🔄 [FRONTEND] Attempting to get user data from storage...");

      // Use Promise.allSettled to handle potential storage failures gracefully
      const [tokenResult, userResult] = await Promise.allSettled([
        secureStorage.getItem("token"),
        secureStorage.getItem("user"),
      ]);

      // Check token result
      if (tokenResult.status === "rejected") {
        console.error("❌ [FRONTEND] Failed to get token:", tokenResult.reason);
        throw new Error("Failed to retrieve authentication token");
      }

      // Check user result
      if (userResult.status === "rejected") {
        console.error("❌ [FRONTEND] Failed to get user:", userResult.reason);
        throw new Error("Failed to retrieve user data");
      }

      const token = tokenResult.value;
      const user = userResult.value;

      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!user) {
        throw new Error("No user data found");
      }

      console.log("✅ [FRONTEND] Retrieved storage data successfully");

      let userData;
      try {
        userData = typeof user === "string" ? JSON.parse(user) : user;
      } catch (parseError) {
        console.error("❌ [FRONTEND] Failed to parse user data:", parseError);
        throw new Error("Invalid user data format");
      }

      const userId = userData._id || userData.id;
      if (!userId) {
        throw new Error("No user ID found in user data");
      }

      console.log("👤 [FRONTEND] User data parsed successfully:", {
        userId: userId.substring(0, 8) + "...",
      });
      return { token, userId };
    } catch (error) {
      console.error("💥 [FRONTEND] getUserData failed:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Failed to get user data"
      );
      return null;
    }
  };

  // Initialize socket connection with better error handling
  const initializeSocket = async (retryCount = 0) => {
    if (isInitializing) {
      console.log("⏸️ [FRONTEND] Socket initialization already in progress...");
      return;
    }

    setIsInitializing(true);
    setConnectionError(null);

    try {
      console.log(
        `🔄 [FRONTEND] Starting socket setup (attempt ${retryCount + 1})...`
      );
      console.log(
        "🔄 [FRONTEND] Socket URL:",
        SOCKET_URL || "http://localhost:5000"
      );

      // Get user data with timeout
      const userData = await Promise.race([
        getUserData(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Storage operation timeout")), 5000)
        ),
      ]);

      if (!userData) {
        throw new Error("Failed to retrieve user authentication data");
      }

      const { token, userId } = userData;
      setCurrentUserId(userId);

      // Disconnect existing socket if any
      if (socket) {
        console.log("🔌 [FRONTEND] Disconnecting existing socket...");
        socket.disconnect();
        setSocket(null);
      }

      console.log("🔌 [FRONTEND] Creating new socket connection...");
      const newSocket = io(SOCKET_URL || "http://localhost:5000", {
        transports: ["websocket", "polling"],
        forceNew: true,
        timeout: 30000, // Increase from 15000 to 30000
        reconnection: true,
        reconnectionAttempts: 10, // Increase from 5 to 10
        reconnectionDelay: 1000, // Decrease from 2000 to 1000
        reconnectionDelayMax: 5000, // Decrease from 10000 to 5000
        auth: {
          token,
        },
      });

      setSocket(newSocket);

      // Set up connection event handlers
      setupSocketEventHandlers(newSocket, userId);
    } catch (error) {
      console.error("💥 [FRONTEND] Socket initialization failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown initialization error";
      setConnectionError(errorMessage);

      // Retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
        console.log(`🔄 [FRONTEND] Retrying socket setup in ${delay}ms...`);
        setTimeout(() => {
          initializeSocket(retryCount + 1);
        }, delay);
      } else {
        console.error(
          "❌ [FRONTEND] Max retry attempts reached. Socket setup failed."
        );
        setConnectionError(
          "Failed to connect after multiple attempts. Please check your connection."
        );
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Separate function to set up socket event handlers
  const setupSocketEventHandlers = (newSocket: Socket, userId: string) => {
    // Connection events
    // Replace the 'connect' event handler:
    newSocket.on("connect", () => {
      console.log("✅ [FRONTEND] Socket connected successfully!");
      console.log("🆔 [FRONTEND] Socket ID:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setSetupAttempts(0);

      // Add delay before setup to ensure connection is stable
      setTimeout(() => {
        const userSetupData = { _id: userId };
        console.log(
          "📤 [FRONTEND] Sending setup event with data:",
          userSetupData
        );
        newSocket.emit("setup", userSetupData);
      }, 1000); // Add 1 second delay
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ [FRONTEND] Connection failed:", error.message);
      console.error("❌ [FRONTEND] Error details:", error);
      setIsConnected(false);
      setConnectionError(`Connection failed: ${error.message}`);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 [FRONTEND] Socket disconnected. Reason:", reason);
      setIsConnected(false);
      setOnlineUsers([]);

      // Don't show error for intentional disconnects
      if (reason !== "io client disconnect") {
        setConnectionError(`Disconnected: ${reason}`);
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 [FRONTEND] Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 [FRONTEND] Reconnection attempt #", attemptNumber);
      setConnectionError(`Reconnecting... (attempt ${attemptNumber})`);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ [FRONTEND] Reconnection failed:", error);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ [FRONTEND] All reconnection attempts failed");
      setConnectionError("Failed to reconnect. Please refresh the app.");
    });

    // Backend response events
    newSocket.on("connected nicely", () => {
      console.log(
        '✅ [FRONTEND] Received "connected nicely" from server - Setup complete!'
      );
      setTimeout(() => {
        if (newSocket.connected) {
          newSocket.emit("requestOnlineUsers");
          console.log("📤 [FRONTEND] Requested online users list");
        }
      }, 100);
    });

    // Handle initial online users list with validation
    newSocket.on("onlineUsersList", (usersList: string[]) => {
      console.log(
        "👥 [FRONTEND] Received initial online users list:",
        usersList
      );
      if (Array.isArray(usersList)) {
        setOnlineUsers(usersList.filter((id) => id && id !== userId));
        console.log(
          "👥 [FRONTEND] Set online users (excluding self):",
          usersList.filter((id) => id && id !== userId)
        );
      } else {
        console.warn(
          "⚠️ [FRONTEND] Invalid online users list received:",
          usersList
        );
        setOnlineUsers([]);
      }
    });

    // Online/offline user status with better state management
    newSocket.on("userOnline", (incomingUserId: string) => {
      console.log("🟢 [FRONTEND] User came online:", incomingUserId);
      if (incomingUserId && incomingUserId !== userId) {
        setOnlineUsers((prev) => {
          const filtered = prev.filter(
            (id) => id !== incomingUserId && id !== userId
          );
          const updated = [...filtered, incomingUserId];
          console.log(
            "👥 [FRONTEND] Updated online users after userOnline:",
            updated
          );
          return updated;
        });
      }
    });

    newSocket.on("userOffline", (incomingUserId: string) => {
      console.log("🔴 [FRONTEND] User went offline:", incomingUserId);
      if (incomingUserId) {
        setOnlineUsers((prev) => {
          const updated = prev.filter((id) => id !== incomingUserId);
          console.log(
            "👥 [FRONTEND] Updated online users after userOffline:",
            updated
          );
          return updated;
        });
      }
    });

    // Message events
    newSocket.on("message received", (message: Message) => {
      console.log("📨 [FRONTEND] Message received:", {
        id: message._id,
        from: message.sender?._id,
        content: message.content?.substring(0, 50) + "...",
        chat: message.chat,
      });
      receiveMessage(message);
    });

    // Enhanced typing events
    newSocket.on(
      "typing",
      (data: { userId: string; chatId: string } | string) => {
        console.log("⌨️ [FRONTEND] Typing event received:", data);

        if (typeof data === "string") {
          setUserTyping({ userId: "unknown", chatId: data });
        } else {
          if (data.userId !== userId) {
            setUserTyping(data);
          }
        }

        setTimeout(() => setUserTyping(null), 3000);
      }
    );

    newSocket.on(
      "stop typing",
      (data: { userId: string; chatId: string } | string) => {
        console.log("⌨️ [FRONTEND] Stop typing event received:", data);

        if (typeof data === "string") {
          setUserTyping((prev) => (prev?.chatId === data ? null : prev));
        } else {
          setUserTyping((prev) =>
            prev?.userId === data.userId && prev?.chatId === data.chatId
              ? null
              : prev
          );
        }
      }
    );

    // Generic event listeners for debugging
    newSocket.onAny((eventName, ...args) => {
      if (eventName !== "ping" && eventName !== "pong") {
        console.log(
          "📡 [FRONTEND] Received event:",
          eventName,
          "with args:",
          args
        );
      }
    });

    newSocket.onAnyOutgoing((eventName, ...args) => {
      if (eventName !== "ping" && eventName !== "pong") {
        console.log("📤 [FRONTEND] Sent event:", eventName, "with args:", args);
      }
    });
  };

  // Manual reconnect function
  const reconnectSocket = () => {
    console.log("🔄 [FRONTEND] Manual reconnect requested...");
    setSetupAttempts(0);
    initializeSocket();
  };

  // Initialize socket on component mount
  useEffect(() => {
    initializeSocket();

    return () => {
      if (socket) {
        console.log("🧹 [FRONTEND] Component cleanup - disconnecting socket");
        socket.disconnect();
      }
    };
  }, []);

  // Function to join a chat room
  const joinChat = (chatId: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ [FRONTEND] Cannot join chat - socket not connected");
      return;
    }
    console.log("🏠 [FRONTEND] Joining chat room:", chatId);
    socket.emit("join chat", chatId);
  };

  // Function to send typing status
  const sendTypingStatus = (chatId: string, isTyping: boolean) => {
    if (!socket || !isConnected) {
      console.warn(
        "⚠️ [FRONTEND] Cannot send typing status - socket not connected"
      );
      return;
    }

    if (isTyping) {
      console.log("⌨️ [FRONTEND] Sending typing status for chat:", chatId);
      socket.emit("typing", { userId: currentUserId, chatId });
    } else {
      console.log("⌨️ [FRONTEND] Sending stop typing for chat:", chatId);
      socket.emit("stop typing", { userId: currentUserId, chatId });
    }
  };

  // Log connection status changes
  useEffect(() => {
    console.log(
      "🔄 [FRONTEND] Connection status changed:",
      isConnected ? "CONNECTED" : "DISCONNECTED"
    );
    if (connectionError) {
      console.log("❌ [FRONTEND] Connection error:", connectionError);
    }
    console.log("👥 [FRONTEND] Online users count:", onlineUsers.length);
  }, [isConnected, onlineUsers, connectionError]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
        connectionError,
        sendTypingStatus,
        userTyping,
        joinChat,
        reconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
