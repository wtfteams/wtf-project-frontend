import { Chat } from "@/types/chat";

export const getChatDisplayName = (chat: Chat, currentUserId: string) => {
  if (chat.isGroupChat) {
    return chat.chatName; // Group chats use actual name
  }
  
  // For 1-on-1 chats, show the OTHER person's name
  const otherUser = chat.users.find(user => user._id !== currentUserId);
  return otherUser?.name || 'Unknown User';
};

export const getChatDisplayImage = (chat: Chat, currentUserId:string) => {
  if (chat.isGroupChat) {
    return chat.chatImage;
  }
  
  const otherUser = chat.users.find(user => user._id !== currentUserId);
  return otherUser?.profilePic;
};