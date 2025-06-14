// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { Alert } from 'react-native';
import axiosInstance from '../api/axios';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { secureStorage } from '../utils/secureStorage';

// Define action types
type AuthAction =
  | { type: 'REQUEST_LOGIN' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'REQUEST_REGISTER' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

// Create context
type AuthContextType = {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'REQUEST_LOGIN':
    case 'REQUEST_REGISTER':
      return {
        ...state,
        isLoading: true,
        error: null, // Clear previous errors
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload, // This should preserve the error message
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null, // Clear errors on logout
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Helper function to extract error message from different error formats
const extractErrorMessage = (error: any): string => {
  // Check for various error response formats
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    return error.response.data.errors;
  }
  
  // Handle validation errors (array of errors)
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((err: any) => err.message || err).join(', ');
  }
  
  // Handle field-specific validation errors
  if (error.response?.data?.details) {
    const details = error.response.data.details;
    if (typeof details === 'object') {
      const errorMessages = Object.values(details).flat().join(', ');
      return errorMessages || 'Validation failed';
    }
  }
  
  // Network or other errors
  if (error.message) {
    return error.message;
  }
  
  // Default fallback
  return 'An unexpected error occurred';
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = await secureStorage.getItem('token');
        const userString = await secureStorage.getItem('user');
        
        if (token && userString) {
          const user = JSON.parse(userString);
          
          // Verify token is still valid by making a test request
          try {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Optional: Validate token with backend
            // await axiosInstance.get('/auth/verify');
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } catch (tokenError) {
            // Token is invalid, clear storage
            console.log('Token validation failed:', tokenError);
            await secureStorage.removeItem('token');
            await secureStorage.removeItem('user');
            delete axiosInstance.defaults.headers.common['Authorization'];
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'REQUEST_LOGIN' });
    
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Save to secure storage
      await secureStorage.setItem('token', token);
      await secureStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Login error:", errorMessage, error);
      
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage,
      });
      
      // Show alert with error message
      Alert.alert("Login Failed", errorMessage);
      
      throw error; // Re-throw to allow component to handle it
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'REQUEST_REGISTER' });
    
    try {
      const response = await axiosInstance.post('/auth/register', credentials);
      const { user, token } = response.data;
      
      console.log("Registration successful:", response.data);
      
      // Save to secure storage
      await secureStorage.setItem('token', token);
      await secureStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token },
      });
      
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Registration error:", errorMessage, error);
      
      dispatch({
        type: 'REGISTER_ERROR',
        payload: errorMessage,
      });
      
      // Show alert with error message (fix: should say "Registration Failed")
      Alert.alert("Registration Failed", errorMessage);
      
      throw error; // Re-throw to allow component to handle it
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API endpoint if available
      if (state.token) {
        await axiosInstance.post('/auth/logout');
      }
    } catch (error) {
      console.error('Error during logout API call', error);
    } finally {
      // Remove from secure storage
      await secureStorage.removeItem('token');
      await secureStorage.removeItem('user');
      
      // Remove auth header
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user function
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    // Also update in storage
    secureStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export logout for use in axios interceptor
export const logout = async () => {
  await secureStorage.removeItem('token');
  await secureStorage.removeItem('user');
  delete axiosInstance.defaults.headers.common['Authorization'];
};