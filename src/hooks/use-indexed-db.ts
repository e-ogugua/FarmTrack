import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

type StoreName = 'activities' | 'inventory' | 'sales' | 'expenses' | 'labour';

interface IndexedDBConfig {
  name: string;
  version: number;
  objectStores: Array<{
    name: StoreName;
    keyPath: string;
    autoIncrement?: boolean;
    indices?: Array<{
      name: string;
      keyPath: string | string[];
      options?: IDBIndexParameters;
    }>;
  }>;
}

interface UseIndexedDBReturn {
  db: IDBDatabase | null;
  initDB: (config: IndexedDBConfig) => Promise<IDBDatabase>;
  add: <T>(storeName: StoreName, item: T) => Promise<IDBValidKey>;
  get: <T>(storeName: StoreName, id: IDBValidKey) => Promise<T | undefined>;
  getAll: <T>(
    storeName: StoreName,
    query?: IDBValidKey | IDBKeyRange,
    indexName?: string
  ) => Promise<T[]>;
  update: <T extends { id: IDBValidKey }>(
    storeName: StoreName,
    item: T
  ) => Promise<IDBValidKey>;
  remove: (storeName: StoreName, id: IDBValidKey) => Promise<void>;
  clear: (storeName: StoreName) => Promise<void>;
  createCursorPagination: <T>(
    storeName: StoreName,
    indexName: string,
    query: IDBValidKey | IDBKeyRange,
    pageSize: number
  ) => {
    next: () => Promise<T[]>;
    prev: () => Promise<T[]>;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useIndexedDB({
  name,
  onError,
}: {
  name: string;
  onError: (error: unknown) => void;
}): UseIndexedDBReturn {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  const initDB = useCallback(
    async (config: IndexedDBConfig): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(config.name, config.version);

        request.onerror = () => {
          const error = request.error || new Error('Failed to open database');
          onError(error);
          reject(error);
        };

        request.onsuccess = () => {
          const database = request.result;
          setDb(database);
          resolve(database);
        };

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;

          // Create object stores and indexes
          config.objectStores.forEach((storeConfig) => {
            if (!database.objectStoreNames.contains(storeConfig.name)) {
              const store = database.createObjectStore(storeConfig.name, {
                keyPath: storeConfig.keyPath,
                autoIncrement: storeConfig.autoIncrement,
              });

              // Create indexes
              storeConfig.indices?.forEach((indexConfig) => {
                store.createIndex(indexConfig.name, indexConfig.keyPath, indexConfig.options);
              });
            }
          });
        };
      });
    },
    [onError]
  );

  const add = useCallback(
    async <T,>(storeName: StoreName, item: T): Promise<IDBValidKey> => {
      if (!db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => resolve(request.result as IDBValidKey);
        request.onerror = () => {
          const error = request.error || new Error('Failed to add item');
          onError(error);
          reject(error);
        };
      });
    },
    [db, onError]
  );

  const get = useCallback(
    async <T,>(storeName: StoreName, id: IDBValidKey): Promise<T | undefined> => {
      if (!db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          const error = request.error || new Error('Failed to get item');
          onError(error);
          reject(error);
        };
      });
    },
    [db, onError]
  );

  const getAll = useCallback(
    async <T,>(
      storeName: StoreName,
      query?: IDBValidKey | IDBKeyRange,
      indexName?: string
    ): Promise<T[]> => {
      if (!db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        let request: IDBRequest<T[]>;
        
        if (indexName) {
          const index = store.index(indexName);
          request = index.getAll(query);
        } else if (query !== undefined) {
          request = store.getAll(query);
        } else {
          request = store.getAll();
        }

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
          const error = request.error || new Error('Failed to get all items');
          onError(error);
          reject(error);
        };
      });
    },
    [db, onError]
  );

  const update = useCallback(
    async <T extends { id: IDBValidKey }>(
      storeName: StoreName,
      item: T
    ): Promise<IDBValidKey> => {
      if (!db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve(request.result as IDBValidKey);
        request.onerror = () => {
          const error = request.error || new Error('Failed to update item');
          onError(error);
          reject(error);
        };
      });
    },
    [db, onError]
  );

  const remove = useCallback(
    async (storeName: StoreName, id: IDBValidKey): Promise<void> => {
      if (!db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          const error = request.error || new Error('Failed to delete item');
          onError(error);
          reject(error);
        };
      });
    },
    [db, onError]
  );

  const clear = useCallback(
    async (storeName: StoreName): Promise<void> => {
      if (!db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          const error = request.error || new Error('Failed to clear store');
          onError(error);
          reject(error);
        };
      });
    },
    [db, onError]
  );

  const createCursorPagination = useCallback(
    <T,>(
      storeName: StoreName,
      indexName: string,
      query: IDBValidKey | IDBKeyRange,
      pageSize: number
    ) => {
      if (!db) throw new Error('Database not initialized');

      let cursor: IDBCursorWithValue | null = null;
      let hasMore = true;
      let isReversed = false;
      const keys: IDBValidKey[] = [];

      const getNextPage = async (): Promise<T[]> => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.openCursor(query);
          const results: T[] = [];
          let advanced = false;

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
            if (!cursor) {
              hasMore = false;
              resolve(results);
              return;
            }

            if (!advanced) {
              if (isReversed && cursor.key) {
                cursor.advance(-pageSize);
                advanced = true;
                return;
              }
              advanced = true;
            }

            results.push(cursor.value);
            keys.push(cursor.primaryKey);

            if (results.length >= pageSize) {
              cursor.continue();
            } else {
              cursor.continue();
            }
          };

          request.onerror = () => {
            const error = request.error || new Error('Failed to fetch next page');
            onError(error);
            reject(error);
          };
        });
      };

      const getPreviousPage = async (): Promise<T[]> => {
        isReversed = true;
        return getNextPage();
      };

      return {
        next: getNextPage,
        prev: getPreviousPage,
        get hasNext() {
          return hasMore;
        },
        get hasPrev() {
          return keys.length > 0;
        },
      };
    },
    [db, onError]
  );

  return {
    db,
    initDB,
    add,
    get,
    getAll,
    update,
    remove,
    clear,
    createCursorPagination,
  };
