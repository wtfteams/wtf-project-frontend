// src/context/ChatContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Chat, CreateChatRequest, CreateGroupRequest } from '../types/chat';
import axiosInstance from '../api/axios';

// Define the state type
interface ChatState {
  messages: any;
  chats: Chat[];
  selectedChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}

// Define action types
type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SELECT_CHAT'; payload: Chat }
  | { type: 'CREATE_CHAT_REQUEST' }
  | { type: 'CREATE_CHAT_SUCCESS'; payload: Chat }
  | { type: 'CREATE_GROUP_SUCCESS'; payload: Chat }
  | { type: 'RENAME_GROUP_SUCCESS'; payload: Chat }
  | { type: 'ADD_USER_TO_GROUP_SUCCESS'; payload: Chat }
  | { type: 'REMOVE_USER_FROM_GROUP_SUCCESS'; payload: Chat }
  | { type: 'CHAT_ERROR'; payload: string }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: { chatId: string; messageId: string } }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ChatState = {
  chats: [],
  selectedChat: null,
  isLoading: false,
  error: null,
  messages: null,
};

// Create context with default values to avoid undefined errors
type ChatContextType = {
  state: ChatState;
  getChats: () => Promise<void>;
  accessChat: (userId: string) => Promise<Chat>;
  selectChat: (chat: Chat) => void;
  createGroupChat: (groupData: CreateGroupRequest) => Promise<void>;
  renameGroupChat: (chatId: string, chatName: string) => Promise<void>;
  addUserToGroup: (chatId: string, userId: string) => Promise<void>;
  removeUserFromGroup: (chatId: string, userId: string) => Promise<void>;
  updateLastMessage: (chatId: string, messageId: string) => void;
  clearError: () => void;
};

const ChatContext = createContext<ChatContextType>({
  state: initialState,
  getChats: async () => {},
  accessChat: async () => ({ _id: '', chatName: '', users: [], isGroupChat: false, createdAt: new Date(), updatedAt: new Date() }),
  selectChat: () => {},
  createGroupChat: async () => {},
  renameGroupChat: async () => {},
  addUserToGroup: async () => {},
  removeUserFromGroup: async () => {},
  updateLastMessage: () => {},
  clearError: () => {},
});

// Reducer function
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CHATS':
      return {
        ...state,
        chats: action.payload,
        isLoading: false,
      };
    case 'SELECT_CHAT':
      return {
        ...state,
        selectedChat: action.payload,
      };
    case 'CREATE_CHAT_REQUEST':
      return {
        ...state,
        isLoading: true,
      };
    case 'CREATE_CHAT_SUCCESS':
      // Add new chat to the beginning of the list or update if exists
      const chatExists = state.chats.some(chat => chat._id === action.payload._id);
      return {
        ...state,
        chats: chatExists
          ? state.chats.map(chat => 
              chat._id === action.payload._id ? action.payload : chat
            )
          : [action.payload, ...state.chats],
        selectedChat: action.payload,
        isLoading: false,
      };
    case 'CREATE_GROUP_SUCCESS':
    case 'RENAME_GROUP_SUCCESS':
    case 'ADD_USER_TO_GROUP_SUCCESS':
    case 'REMOVE_USER_FROM_GROUP_SUCCESS':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat._id === action.payload._id ? action.payload : chat
        ),
        selectedChat: state.selectedChat?._id === action.payload._id 
          ? action.payload 
          : state.selectedChat,
        isLoading: false,
      };
    case 'CHAT_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'UPDATE_LAST_MESSAGE':
      return {
        ...state,
        // Move the chat with the new message to the top
        chats: state.chats.map(chat => {
          if (chat._id === action.payload.chatId) {
            return {
              ...chat,
              lastMessage: {
                ...chat.lastMessage,
                _id: action.payload.messageId,
              } as any, // Type assertion needed as we don't have full message details
            };
          }
          return chat;
        }).sort((a, b) => {
          if (a._id === action.payload.chatId) return -1;
          if (b._id === action.payload.chatId) return 1;
          return 0;
        }),
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Get all chats
  const getChats = async () => {
    try {
      const response = await axiosInstance.get('/chats');
      dispatch({ type: 'SET_CHATS', payload: response.data });
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      dispatch({
        type: 'CHAT_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch chats',
      });
    }
  };

  // Access or create chat with a user
  const accessChat = async (userId: string): Promise<Chat> => {
    dispatch({ type: 'CREATE_CHAT_REQUEST' });
    try {
      const response = await axiosInstance.post('/chats', { userId });
      dispatch({ type: 'CREATE_CHAT_SUCCESS', payload: response.data });
      return response.data;
    } catch (error: any) {
      console.error('Error accessing chat:', error);
      dispatch({
        type: 'CHAT_ERROR',
        payload: error.response?.data?.message || 'Failed to access chat',
      });
      throw error;
    }
  };

  // Select a chat
  const selectChat = (chat: Chat) => {
    dispatch({ type: 'SELECT_CHAT', payload: chat });
  };

  // Create a group chat
  const createGroupChat = async (groupData: CreateGroupRequest) => {
    dispatch({ type: 'CREATE_CHAT_REQUEST' });
    try {
      const response = await axiosInstance.post('/chats/group', groupData);
      dispatch({ type: 'CREATE_GROUP_SUCCESS', payload: response.data });
    } catch (error: any) {
      console.error('Error creating group chat:', error);
      dispatch({
        type: 'CHAT_ERROR',
        payload: error.response?.data?.message || 'Failed to create group chat',
      });
    }
  };

  // Rename a group chat
  const renameGroupChat = async (chatId: string, chatName: string) => {
    try {
      const response = await axiosInstance.put('/chats/group/rename', { chatId, chatName });
      dispatch({ type: 'RENAME_GROUP_SUCCESS', payload: response.data });
    } catch (error: any) {
      console.error('Error renaming group chat:', error);
      dispatch({
        type: 'CHAT_ERROR',
        payload: error.response?.data?.message || 'Failed to rename group chat',
      });
    }
  };

  // Add a user to a group
  const addUserToGroup = async (chatId: string, userId: string) => {
    try {
      const response = await axiosInstance.put('/chats/group/add', { chatId, userId });
      dispatch({ type: 'ADD_USER_TO_GROUP_SUCCESS', payload: response.data });
    } catch (error: any) {
      console.error('Error adding user to group:', error);
      dispatch({
        type: 'CHAT_ERROR',
        payload: error.response?.data?.message || 'Failed to add user to group',
      });
    }
  };

  // Remove a user from a group
  const removeUserFromGroup = async (chatId: string, userId: string) => {
    try {
      const response = await axiosInstance.put('/chats/group/remove', { chatId, userId });
      dispatch({ type: 'REMOVE_USER_FROM_GROUP_SUCCESS', payload: response.data });
    } catch (error: any) {
      console.error('Error removing user from group:', error);
      dispatch({
        type: 'CHAT_ERROR',
        payload: error.response?.data?.message || 'Failed to remove user from group',
      });
    }
  };

  // Update last message in a chat
  const updateLastMessage = (chatId: string, messageId: string) => {
    dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: { chatId, messageId } });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        getChats,
        accessChat,
        selectChat,
        createGroupChat,
        renameGroupChat,
        addUserToGroup,
        removeUserFromGroup,
        updateLastMessage,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook for using chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
