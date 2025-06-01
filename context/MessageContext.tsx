// src/context/MessageContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Message, SendMessageRequest } from '../types/message';
import axiosInstance from '../api/axios';
import { useChat } from './ChatContext';

// Define the state type
interface MessageState {
  messages: Record<string, Message[]>; // chatId -> messages[]
  isLoading: boolean;
  error: string | null;
}

// Define action types
type MessageAction =
  | { type: 'FETCH_MESSAGES_REQUEST'; payload: string }
  | { type: 'FETCH_MESSAGES_SUCCESS'; payload: { chatId: string; messages: Message[] } }
  | { type: 'SEND_MESSAGE_REQUEST' }
  | { type: 'SEND_MESSAGE_SUCCESS'; payload: Message }
  | { type: 'RECEIVE_MESSAGE'; payload: Message }
  | { type: 'MESSAGE_ERROR'; payload: string }
  | { type: 'MARK_MESSAGES_READ'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: MessageState = {
  messages: {},
  isLoading: false,
  error: null,
};

// Create context
type MessageContextType = {
  state: MessageState;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (messageData: SendMessageRequest) => Promise<void>;
  receiveMessage: (message: Message) => void;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  clearError: () => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Reducer function
const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'FETCH_MESSAGES_REQUEST':
      return {
        ...state,
        isLoading: true,
      };
    case 'FETCH_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages,
        },
        isLoading: false,
      };
    case 'SEND_MESSAGE_REQUEST':
      return {
        ...state,
        isLoading: true,
      };
    case 'SEND_MESSAGE_SUCCESS':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chat]: state.messages[action.payload.chat]
            ? [...state.messages[action.payload.chat], action.payload]
            : [action.payload],
        },
        isLoading: false,
      };
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chat]: state.messages[action.payload.chat]
            ? [...state.messages[action.payload.chat], action.payload]
            : [action.payload],
        },
      };
    case 'MESSAGE_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'MARK_MESSAGES_READ':
      return {
        ...state,
        // This is a simplistic approach - ideally we'd update the readBy field
        // for all messages in the chat
        messages: state.messages,
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
interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const chatContext = useChat();

  // Fetch messages for a chat
  const fetchMessages = async (chatId: string) => {
    dispatch({ type: 'FETCH_MESSAGES_REQUEST', payload: chatId });
    try {
      const response = await axiosInstance.get(`/messages/${chatId}`);
      dispatch({
        type: 'FETCH_MESSAGES_SUCCESS',
        payload: { chatId, messages: response.data },
      });
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      dispatch({
        type: 'MESSAGE_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch messages',
      });
    }
  };

  // Send a message
  const sendMessage = async (messageData: SendMessageRequest) => {
    dispatch({ type: 'SEND_MESSAGE_REQUEST' });
    try {
      const response = await axiosInstance.post('/messages', messageData);
      dispatch({ type: 'SEND_MESSAGE_SUCCESS', payload: response.data });
      
      // Update last message in chat
      chatContext.updateLastMessage(messageData.chatId, response.data._id);
      
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'MESSAGE_ERROR',
        payload: error.response?.data?.message || 'Failed to send message',
      });
      throw error;
    }
  };

  // Receive a message (from socket)
  const receiveMessage = (message: Message) => {
    dispatch({ type: 'RECEIVE_MESSAGE', payload: message });
    
    // Update last message in chat
    chatContext.updateLastMessage(message.chat, message._id);
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId: string) => {
    try {
      await axiosInstance.put(`/messages/read/${chatId}`);
      dispatch({ type: 'MARK_MESSAGES_READ', payload: chatId });
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <MessageContext.Provider
      value={{
        state,
        fetchMessages,
        sendMessage,
        receiveMessage,
        markMessagesAsRead,
        clearError,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook for using message context
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};