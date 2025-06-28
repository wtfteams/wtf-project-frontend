import { axiosInstance } from "@/api/axios";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

interface AuthUser {
  _id: string;
  // Add other user properties here as needed
  [key: string]: any;
}

interface AuthState {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (formData: FormData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  friendRequests: AuthUser[]; // New state for friend requests
  getFriendRequests: () => Promise<void>; // New method to fetch friend requests
  subscribeToFriendRequests: () => void; // New method to subscribe to friend request notifications
  unsubscribeFromFriendRequests: () => void; // New method to unsubscribe
}

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  friendRequests: [],


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

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("res", res);

      set({ authUser: res.data });
      console.log("Account created successfully");
      get().connectSocket();
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      console.log("Signup error:", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      console.log("Logged in successfully");
      get().connectSocket();
    } catch (error: any) {
      console.log("Login error:", error.response.data.message);
      const errorMessage =
      error.response?.data?.message || "Login failed";
      throw new Error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      console.log("Logged out successfully");
      get().disconnectSocket();
    } catch (error: any) {
      console.log("Logout error:", error.response.data.message);
    }
  },

  updateProfile: async (formData) => {
    try {
      set({ isUpdatingProfile: true });
      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set({ authUser: data });
      console.log("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.log(error.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ friendRequests: res.data });
    } catch (error: any) {
      console.error("Error fetching friend requests:", error.response?.data?.message || error.message);
    }
  },

  subscribeToFriendRequests: () => {
    const socket = get().socket;
    socket?.on("newFriendRequest", (data: { senderId: string; message: string }) => {
      // Fetch updated friend requests
      get().getFriendRequests();
    });
  },

  unsubscribeFromFriendRequests: () => {
    const socket = get().socket;
    socket?.off("newFriendRequest");
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
    // Subscribe to friend requests when socket connects
    get().subscribeToFriendRequests();
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().unsubscribeFromFriendRequests();
      get().socket?.disconnect();
    }
  },
}));
