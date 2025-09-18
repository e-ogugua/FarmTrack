import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    sync?: boolean;
    onError?: (error: unknown) => void;
  } = {}
) {
  const { sync = true, onError } = options;
  
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      if (onError) {
        onError(error);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to read from local storage',
          variant: 'destructive',
        });
      }
      return initialValue;
    }
  }, [initialValue, key, onError]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
        if (onError) {
          onError(error);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to save to local storage',
            variant: 'destructive',
          });
        }
      }
    },
    [key, storedValue, onError]
  );

  // Sync changes across tabs/windows if sync is enabled
  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;

      try {
        const newValue = JSON.parse(event.newValue);
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error parsing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, sync]);

  // Handle the case where the storage gets corrupted
  const clearStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
      if (onError) {
        onError(error);
      }
    }
  }, [key, initialValue, onError]);

  return [storedValue, setValue, clearStorage] as const;
}

// Example usage:
// const [user, setUser, clearUser] = useLocalStorage('user', { name: '', email: '' });
