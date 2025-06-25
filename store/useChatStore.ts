import { axiosInstance } from "@/api/axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface User {
  _id: string;
  fullName?: string;
  name?: string;
  profilePic?: string;
  [key: string]: any;
}

interface Message {
  _id: string;
  senderId: string;
  text?: string;
  image?: string;
  createdAt: string; 
  [key: string]: any;
}

interface ChatState {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isOtherUserTyping: boolean; 
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: any) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  subscribeToTyping: () => void;
  unsubscribeFromTyping: () => void;
  emitTyping: (isTyping: boolean) => void;
  setSelectedUser: (selectedUser: User | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isOtherUserTyping: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error: any) {
      console.error("Error fetching users:", error.response.data.message);
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
      console.error("Error fetching messages:", error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error: any) {
      console.error("Error sending message:", error.response.data.message);
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
