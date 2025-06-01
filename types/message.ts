// src/types/message.ts
import { User } from './auth';

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: string;
  readBy: {
    _id: string;
    name: string;
  }[];
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  content: string;
  chatId: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
}