// src/types/auth.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  about?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}