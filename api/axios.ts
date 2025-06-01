// src/api/axios.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../utils/secureStorage';
import { API_URL } from '../constants';
import { logout } from '../context/AuthContext';

// Create axios instance with base URL
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && originalRequest) {
      try {
        // Attempt to logout the user
        await logout();
      } catch (logoutError) {
        console.error('Error during logout:', logoutError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
