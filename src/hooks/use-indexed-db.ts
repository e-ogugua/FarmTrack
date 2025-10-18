import { useCallback, useState, useEffect } from 'react';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

type StoreName = 'activities' | 'inventory' | 'sales' | 'expenses' | 'labour' | 'weather' | 'tax-records';

interface UseIndexedDBReturn {
  db: IDBDatabase | null;
  isInitialized: boolean;
  error: Error | null;
  add: <T>(storeName: StoreName, item: Omit<T, 'id'>) => Promise<IDBValidKey>;
  get: <T>(storeName: StoreName, key: IDBValidKey) => Promise<T | undefined>;
  getAll: <T>(storeName: StoreName) => Promise<T[]>;
  update: <T extends { id: IDBValidKey }>(
    storeName: StoreName,
    item: T
  ) => Promise<void>;
  remove: (storeName: StoreName, key: IDBValidKey) => Promise<void>;
  clear: (storeName: StoreName) => Promise<void>;
}

// Default error handler
const defaultErrorHandler = (error: unknown) => {
  console.error('IndexedDB error:', error);
};

export function useIndexedDB({
  name = 'farmtrack-db',
  onError = defaultErrorHandler,
  version = 1,
}: {
  name?: string;
  onError?: (error: unknown) => void;
  version?: number;
} = {}): UseIndexedDBReturn {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handle errors consistently
  const handleError = useCallback(
    (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError(error);
    },
    [onError]
  );

  // Initialize IndexedDB only on the client side
  useEffect(() => {
    if (!isBrowser) {
      return () => {}; // Return empty cleanup function for SSR
    }

    let isMounted = true;
    
    const initDB = () => {
      try {
        const request = indexedDB.open(name, version);
        
        request.onerror = (event) => {
          const target = event.target as IDBOpenDBRequest;
          if (isMounted) handleError(target.error);
        };
        
        request.onsuccess = () => {
          if (isMounted) {
            const db = request.result;
            setDb(db);
            setIsInitialized(true);
          }
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          // Create object stores if they don't exist
          const storeNames: StoreName[] = ['activities', 'inventory', 'sales', 'expenses', 'labour', 'weather', 'tax-records'];
          storeNames.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            }
          });
        };
      } catch (err) {
        if (isMounted) handleError(err);
      }
    };
    
    initDB();
    
    return () => {
      isMounted = false;
      if (db) {
        db.close();
      }
    };
  }, [name, version, handleError, db]);
  
  // Add operation
  const add = useCallback(async <T,>(storeName: StoreName, item: Omit<T, 'id'>): Promise<IDBValidKey> => {
    if (!isBrowser || !db) throw new Error('IndexedDB not available');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({ ...item, createdAt: new Date().toISOString() });
      
      request.onsuccess = () => resolve(request.result as IDBValidKey);
      request.onerror = () => reject(request.error);
    });
  }, [db]);
  
  // Get operation
  const get = useCallback(async <T,>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> => {
    if (!isBrowser || !db) throw new Error('IndexedDB not available');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }, [db]);
  
  // Get All operation
  const getAll = useCallback(async <T,>(storeName: StoreName): Promise<T[]> => {
    if (!isBrowser || !db) throw new Error('IndexedDB not available');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }, [db]);
  
  // Update operation
  const update = useCallback(async <T extends { id: IDBValidKey }>(
    storeName: StoreName,
    item: T
  ): Promise<void> => {
    if (!isBrowser || !db) throw new Error('IndexedDB not available');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({
        ...item,
        updatedAt: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);
  
  // Remove operation
  const remove = useCallback(async (storeName: StoreName, key: IDBValidKey): Promise<void> => {
    if (!isBrowser || !db) throw new Error('IndexedDB not available');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);
  
  // Clear operation
  const clear = useCallback(async (storeName: StoreName): Promise<void> => {
    if (!isBrowser || !db) throw new Error('IndexedDB not available');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);
  
  return {
    db,
    isInitialized,
    error,
    add,
    get,
    getAll,
    update,
    remove,
    clear,
  };
}
