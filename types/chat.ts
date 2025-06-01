// src/types/chat.ts
import { User } from './auth';
import { Message } from './message';

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  groupAdmin?: User;
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatRequest {
  userId: string;
}

export interface CreateGroupRequest {
  name: string;
  users: string[];
}