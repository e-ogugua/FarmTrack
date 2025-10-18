import { createContext, useContext, ReactNode } from 'react';
import { useIndexedDB } from '@/hooks/use-indexed-db';

type StoreName = 'activities' | 'inventory' | 'sales' | 'expenses' | 'labour' | 'weather' | 'tax-records';

interface DatabaseContextType {
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

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const {
    db,
    isInitialized,
    error,
    add,
    get,
    getAll,
    update,
    remove,
    clear,
  } = useIndexedDB({
    name: 'farmtrack-db',
    onError: (error) => {
      console.error('Database error:', error);
    },
  });

  const value = {
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

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
