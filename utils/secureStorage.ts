import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Define error types for better error handling
class StorageError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

// Utility function to check if we're in a web environment
const isWeb = Platform.OS === 'web';

// Utility function to validate key
const validateKey = (key: string): void => {
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw new StorageError('Invalid key provided', 'INVALID_KEY');
  }
};

// Utility function with timeout for operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new StorageError('Operation timeout', 'TIMEOUT')), timeoutMs)
    )
  ]);
};

export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      validateKey(key);
      console.log(`🔐 [STORAGE] Getting item: ${key}`);

      if (isWeb) {
        // Web fallback with error handling
        try {
          const item = localStorage.getItem(key);
          console.log(`✅ [STORAGE] Retrieved item from localStorage: ${key}`);
          return item;
        } catch (webError) {
          console.error(`❌ [STORAGE] localStorage error for key ${key}:`, webError);
          throw new StorageError(
            'Failed to access localStorage',
            'WEB_STORAGE_ERROR',
            webError as Error
          );
        }
      }

      // Native secure store with timeout
      try {
        const result = await withTimeout(SecureStore.getItemAsync(key), 8000);
        console.log(`✅ [STORAGE] Retrieved item from SecureStore: ${key}`);
        return result;
      } catch (nativeError) {
        console.error(`❌ [STORAGE] SecureStore error for key ${key}:`, nativeError);
        
        if (nativeError instanceof StorageError && nativeError.code === 'TIMEOUT') {
          throw new StorageError(
            'Storage operation timed out',
            'TIMEOUT',
            nativeError
          );
        }
        
        throw new StorageError(
          'Failed to access secure storage',
          'NATIVE_STORAGE_ERROR',
          nativeError as Error
        );
      }

    } catch (error) {
      console.error(`💥 [STORAGE] Failed to get item ${key}:`, error);
      
      // Re-throw StorageError as-is
      if (error instanceof StorageError) {
        throw error;
      }
      
      // Wrap other errors
      throw new StorageError(
        `Failed to retrieve ${key}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      validateKey(key);
      
      if (!value || typeof value !== 'string') {
        throw new StorageError('Invalid value provided', 'INVALID_VALUE');
      }

      console.log(`🔐 [STORAGE] Setting item: ${key}`);

      if (isWeb) {
        try {
          localStorage.setItem(key, value);
          console.log(`✅ [STORAGE] Stored item in localStorage: ${key}`);
          return;
        } catch (webError) {
          console.error(`❌ [STORAGE] localStorage error for key ${key}:`, webError);
          
          // Check for quota exceeded error
          if (webError instanceof DOMException && webError.code === 22) {
            throw new StorageError(
              'Storage quota exceeded',
              'QUOTA_EXCEEDED',
              webError
            );
          }
          
          throw new StorageError(
            'Failed to write to localStorage',
            'WEB_STORAGE_ERROR',
            webError as Error
          );
        }
      }

      // Native secure store with timeout
      try {
        await withTimeout(SecureStore.setItemAsync(key, value), 8000);
        console.log(`✅ [STORAGE] Stored item in SecureStore: ${key}`);
      } catch (nativeError) {
        console.error(`❌ [STORAGE] SecureStore error for key ${key}:`, nativeError);
        
        if (nativeError instanceof StorageError && nativeError.code === 'TIMEOUT') {
          throw new StorageError(
            'Storage operation timed out',
            'TIMEOUT',
            nativeError
          );
        }
        
        throw new StorageError(
          'Failed to write to secure storage',
          'NATIVE_STORAGE_ERROR',
          nativeError as Error
        );
      }

    } catch (error) {
      console.error(`💥 [STORAGE] Failed to set item ${key}:`, error);
      
      if (error instanceof StorageError) {
        throw error;
      }
      
      throw new StorageError(
        `Failed to store ${key}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      validateKey(key);
      console.log(`🔐 [STORAGE] Removing item: ${key}`);

      if (isWeb) {
        try {
          localStorage.removeItem(key);
          console.log(`✅ [STORAGE] Removed item from localStorage: ${key}`);
          return;
        } catch (webError) {
          console.error(`❌ [STORAGE] localStorage error for key ${key}:`, webError);
          throw new StorageError(
            'Failed to remove from localStorage',
            'WEB_STORAGE_ERROR',
            webError as Error
          );
        }
      }

      // Native secure store with timeout
      try {
        await withTimeout(SecureStore.deleteItemAsync(key), 8000);
        console.log(`✅ [STORAGE] Removed item from SecureStore: ${key}`);
      } catch (nativeError) {
        console.error(`❌ [STORAGE] SecureStore error for key ${key}:`, nativeError);
        
        if (nativeError instanceof StorageError && nativeError.code === 'TIMEOUT') {
          throw new StorageError(
            'Storage operation timed out',
            'TIMEOUT',
            nativeError
          );
        }
        
        throw new StorageError(
          'Failed to remove from secure storage',
          'NATIVE_STORAGE_ERROR',
          nativeError as Error
        );
      }

    } catch (error) {
      console.error(`💥 [STORAGE] Failed to remove item ${key}:`, error);
      
      if (error instanceof StorageError) {
        throw error;
      }
      
      throw new StorageError(
        `Failed to remove ${key}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  },

  // Utility method to check if storage is available
  isAvailable: async (): Promise<boolean> => {
    try {
      const testKey = '__storage_test__';
      const testValue = 'test';
      
      await secureStorage.setItem(testKey, testValue);
      const retrieved = await secureStorage.getItem(testKey);
      await secureStorage.removeItem(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      console.error('❌ [STORAGE] Storage availability check failed:', error);
      return false;
    }
  },

  // Utility method to clear all items (use with caution)
  clear: async (): Promise<void> => {
    if (isWeb) {
      try {
        localStorage.clear();
        console.log('✅ [STORAGE] Cleared all localStorage items');
      } catch (error) {
        throw new StorageError(
          'Failed to clear localStorage',
          'WEB_STORAGE_ERROR',
          error as Error
        );
      }
    } else {
      // For native, you'd need to keep track of keys or handle this differently
      console.warn('⚠️ [STORAGE] Clear operation not implemented for native SecureStore');
      throw new StorageError(
        'Clear operation not supported on native platform',
        'UNSUPPORTED_OPERATION'
      );
    }
  }
};

// Export the error class for external use
export { StorageError };
