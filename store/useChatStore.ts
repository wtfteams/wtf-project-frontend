// useChatStore.ts
import { axiosInstance } from "@/api/axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  friendStatus?: "none" | "sent" | "received" | "friend";
  [key: string]: any;
}

interface Message {
  _id: string;
  text?: string;
  mediaType?: "text" | "image" | "video" | "gif" | "file";
  mediaUrl?: string;
  thumbnail?: string;
  fileName?: string;
  senderId: string;
  createdAt: string;
  [key: string]: any;
}

interface ChatState {
  messages: Message[];
  users: User[];
  searchResults: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isOtherUserTyping: boolean;
  isSearchingUsers: boolean;
  friendStatusMap: Record<string, string>; // userId -> status
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: {
    text?: string;
    mediaType?: "text" | "image" | "video" | "gif" | "file";
    mediaUri?: string;
    fileName?: string;
  }) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (receiverId: string) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  subscribeToTyping: () => void;
  unsubscribeFromTyping: () => void;
  emitTyping: (isTyping: boolean) => void;
  setSelectedUser: (selectedUser: User | null) => void;
  addUserToList: (user: User) => void;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  updateFriendStatus: (userId: string, status: string) => void;
  subscribeToFriendStatus: () => void;
  unsubscribeFromFriendStatus: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  searchResults: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isOtherUserTyping: false,
  isSearchingUsers: false,
  friendStatusMap: {},

  updateFriendStatus: (userId: string, status: string) => {
    set((state) => ({
      friendStatusMap: { ...state.friendStatusMap, [userId]: status },
      searchResults: state.searchResults.map((user) =>
        user._id === userId ? { ...user, friendStatus: status as any } : user
      ),
    }));
  },

  subscribeToFriendStatus: () => {
    const socket = useAuthStore.getState().socket;

    socket?.on(
      "friendRequestSent",
      (data: { userId: string; status: string }) => {
        get().updateFriendStatus(data.userId, data.status);
      }
    );

    socket?.on(
      "friendRequestAccepted",
      (data: { friendId: string; status: string }) => {
        get().updateFriendStatus(data.friendId, data.status);
      }
    );

    socket?.on(
      "friendRequestRejected",
      (data: { userId: string; status: string }) => {
        get().updateFriendStatus(data.userId, data.status);
      }
    );

    socket?.on(
      "newFriendRequest",
      (data: { senderId: string; status: string }) => {
        get().updateFriendStatus(data.senderId, data.status);
      }
    );
  },

  unsubscribeFromFriendStatus: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("friendRequestSent");
    socket?.off("friendRequestAccepted");
    socket?.off("friendRequestRejected");
    socket?.off("newFriendRequest");
  },

  addUserToList: (user: User) => {
    const { users } = get();
    const userExists = users.some(
      (existingUser) => existingUser._id === user._id
    );

    if (!userExists) {
      set({ users: [...users, user] });
    }
  },

  subscribeToUpdates: () => {
    const socket = useAuthStore.getState().socket;

    socket?.on("addToChatList", (userData: User) => {
      get().addUserToList(userData);
    });

    socket?.on("refreshChatList", () => {
      const { users } = get();
      if (users.length === 0) {
        get().getUsers();
      }
    });

    // Subscribe to friend status updates
    get().subscribeToFriendStatus();
  },

  unsubscribeFromUpdates: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("addToChatList");
    socket?.off("refreshChatList");
    socket?.off("friendRequestAccepted");

    // Unsubscribe from friend status updates
    get().unsubscribeFromFriendStatus();
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error: any) {
      console.error(
        "Error fetching users:",
        error.response?.data?.message || error.message
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error: any) {
      console.error(
        "Error fetching messages:",
        error.response?.data?.message || error.message
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: {
    text?: string;
    mediaType?: "text" | "image" | "video" | "gif" | "file";
    mediaUri?: string;
    fileName?: string;
  }) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      // For text messages: Send JSON not FormData!
      if (messageData.mediaType === "text" && !messageData.mediaUri) {
        const res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          {
            text: messageData.text,
            mediaType: "text",
          }
        );
        set({ messages: [...messages, res.data] });
        return;
      }
      // For media messages: Use FormData
      const formData = new FormData();
      if (messageData.text) {
        formData.append("text", messageData.text);
      }
      if (messageData.mediaType) {
        formData.append("mediaType", messageData.mediaType);
      }
      if (messageData.mediaUri) {
        const fileExtension = messageData.mediaUri.split(".").pop();
        formData.append("media", {
          uri: messageData.mediaUri,
          type: `${messageData.mediaType}/${fileExtension}`,
          name: messageData.fileName || `media.${fileExtension}`,
        } as any);
      }
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({ messages: [...messages, res.data] });
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  searchUsers: async (query: string) => {
    set({ isSearchingUsers: true });
    try {
      const res = await axiosInstance.get(
        `/friends/search?query=${encodeURIComponent(query)}`
      );
      const usersWithStatus = res.data.map((user: User) => ({
        ...user,
        friendStatus:
          user.friendStatus || get().friendStatusMap[user._id] || "none",
      }));
      set({ searchResults: usersWithStatus });
    } catch (error: any) {
      console.error(
        "Error searching users:",
        error.response?.data?.message || error.message
      );
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  sendFriendRequest: async (receiverId: string) => {
    try {
      const res = await axiosInstance.post(`/friends/send/${receiverId}`);
      console.log(res.data.message);

      // Optimistically update the UI
      get().updateFriendStatus(receiverId, "sent");

      const { socket, authUser } = useAuthStore.getState();
      if (socket && authUser) {
        socket.emit("sendFriendRequest", {
          senderId: authUser._id,
          receiverId,
        });
      }
    } catch (error: any) {
      console.error(
        "Error sending friend request:",
        error.response?.data?.message || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to send friend request"
      );
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket?.on("newMessage", (newMessage: Message) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;

    socket?.on("userTyping", (data) => {
      const { selectedUser } = get();
      if (data.userId === selectedUser?._id) {
        set({ isOtherUserTyping: data.isTyping });
      }
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("userTyping");
  },

  emitTyping: (isTyping: boolean) => {
    const { selectedUser } = get();
    const { authUser, socket } = useAuthStore.getState();

    if (selectedUser && authUser && socket) {
      socket.emit(isTyping ? "typing" : "stopTyping", {
        userId: authUser._id,
        receiverId: selectedUser._id,
      });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
