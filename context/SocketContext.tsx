// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import { secureStorage } from '../utils/secureStorage';
import { useMessage } from './MessageContext';
import { useChat } from './ChatContext';
import { Message } from '../types/message';
import { User } from '../types/auth';

// Define context type
interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isConnected: boolean;
  sendTypingStatus: (chatId: string, isTyping: boolean) => void;
  userTyping: { userId: string; chatId: string } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userTyping, setUserTyping] = useState<{ userId: string; chatId: string } | null>(null);
  
  const { receiveMessage } = useMessage();
  const { state: chatState } = useChat();

  // Initialize socket connection
  useEffect(() => {
    const setupSocket = async () => {
      try {
        const token = await secureStorage.getItem('token');
        
        if (!token) return;
        
        const newSocket = io(SOCKET_URL || 'http://localhost:5000', {
          auth: {
            token: `Bearer ${token}`
          },
          transports: ['websocket']
        });

        setSocket(newSocket);

        // Socket event listeners
        newSocket.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        newSocket.on('online-users', (users: string[]) => {
          setOnlineUsers(users);
        });

        newSocket.on('message-received', (message: Message) => {
          console.log('Message received:', message);
          receiveMessage(message);
        });

        newSocket.on('typing', ({ userId, chatId }: { userId: string; chatId: string }) => {
          setUserTyping({ userId, chatId });
          
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setUserTyping(null);
          }, 3000);
        });

        newSocket.on('stop-typing', () => {
          setUserTyping(null);
        });

        newSocket.on('user-joined-group', ({ chatId, user }: { chatId: string; user: User }) => {
          console.log(`${user.name} joined the group`);
          // You could update your chat state here if needed
        });

        newSocket.on('user-left-group', ({ chatId, user }: { chatId: string; user: User }) => {
          console.log(`${user.name} left the group`);
          // You could update your chat state here if needed
        });

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        console.error('Socket setup failed:', error);
      }
    };

    setupSocket();
  }, []);

  // Function to send typing status
  const sendTypingStatus = (chatId: string, isTyping: boolean) => {
    if (!socket || !isConnected) return;
    
    if (isTyping) {
      socket.emit('typing', { chatId });
    } else {
      socket.emit('stop-typing', { chatId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
        sendTypingStatus,
        userTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for using socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
