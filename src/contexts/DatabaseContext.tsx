'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { toast } from '@/components/ui/use-toast';
import { Activity, Expense, InventoryItem, Labour, Sale } from '@/types';

type StoreName = 'activities' | 'inventory' | 'sales' | 'expenses' | 'labour';

interface DatabaseContextType {
  // Core database state
  isInitialized: boolean;
  error: Error | null;
  db: IDBDatabase | null;
  
  // Generic methods
  add: <T extends Record<string, any>>(storeName: StoreName, item: T) => Promise<IDBValidKey>;
  get: <T = any>(storeName: StoreName, id: IDBValidKey) => Promise<T | undefined>;
  getAll: <T = any>(storeName: StoreName, query?: IDBValidKey | IDBKeyRange, indexName?: string) => Promise<T[]>;
  update: <T extends { id: IDBValidKey }>(storeName: StoreName, item: T) => Promise<void>;
  remove: (storeName: StoreName, id: IDBValidKey) => Promise<void>;
  clear: (storeName: StoreName) => Promise<void>;
  
  // Activity methods
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IDBValidKey>;
  getActivity: (id: IDBValidKey) => Promise<Activity | undefined>;
  getActivities: () => Promise<Activity[]>;
  updateActivity: (id: IDBValidKey, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: IDBValidKey) => Promise<void>;
  
  // Inventory methods
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IDBValidKey>;
  getInventoryItem: (id: IDBValidKey) => Promise<InventoryItem | undefined>;
  getInventoryItems: () => Promise<InventoryItem[]>;
  updateInventoryItem: (id: IDBValidKey, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: IDBValidKey) => Promise<void>;
  
  // Sale methods
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'total'>) => Promise<IDBValidKey>;
  getSale: (id: IDBValidKey) => Promise<Sale | undefined>;
  getSales: () => Promise<Sale[]>;
  updateSale: (id: IDBValidKey, updates: Partial<Sale>) => Promise<void>;
  deleteSale: (id: IDBValidKey) => Promise<void>;
  
  // Expense methods
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IDBValidKey>;
  getExpense: (id: IDBValidKey) => Promise<Expense | undefined>;
  getExpenses: () => Promise<Expense[]>;
  updateExpense: (id: IDBValidKey, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: IDBValidKey) => Promise<void>;
  
  // Labour methods
  addLabour: (labour: Omit<Labour, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IDBValidKey>;
  getLabour: (id: IDBValidKey) => Promise<Labour | undefined>;
  getLabours: () => Promise<Labour[]>;
  updateLabour: (id: IDBValidKey, updates: Partial<Labour>) => Promise<void>;
  deleteLabour: (id: IDBValidKey) => Promise<void>;
  
  // Export/Import
  exportData: () => Promise<Record<string, any>>;
  importData: (data: Record<string, any>) => Promise<void>;
  
  // Maintenance
  clearAllData: () => Promise<void>;
  rebuildIndexes: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const handleError = useCallback((error: unknown) => {
    console.error('Database error:', error);
    const errorObj = error instanceof Error ? error : new Error(String(error));
    setError(errorObj);
    
    toast({
      title: 'Database Error',
      description: errorObj.message || 'An error occurred with the local database',
      variant: 'destructive',
    });
    
    return errorObj;
  }, []);
  
  const {
    db,
    initDB,
    add,
    get,
    getAll,
    update,
    remove,
    clear,
  } = useIndexedDB({ 
    name: 'FarmDB',
    onError: handleError,
  });

  // Initialize the database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDB({
          name: 'FarmDB',
          version: 1,
          objectStores: [
            {
              name: 'activities',
              keyPath: 'id',
              autoIncrement: true,
              indices: [
                { name: 'date', keyPath: 'date' },
                { name: 'activityType', keyPath: 'activityType' },
                { name: 'crop', keyPath: 'crop' },
              ],
            },
            {
              name: 'inventory',
              keyPath: 'id',
              autoIncrement: true,
              indices: [
                { name: 'name', keyPath: 'name', unique: true },
                { name: 'category', keyPath: 'category' },
              ],
            },
            {
              name: 'sales',
              keyPath: 'id',
              autoIncrement: true,
              indices: [
                { name: 'date', keyPath: 'date' },
                { name: 'product', keyPath: 'product' },
                { name: 'customer', keyPath: 'customer' },
              ],
            },
            {
              name: 'expenses',
              keyPath: 'id',
              autoIncrement: true,
              indices: [
                { name: 'date', keyPath: 'date' },
                { name: 'category', keyPath: 'category' },
                { name: 'supplier', keyPath: 'supplier' },
              ],
            },
            {
              name: 'labour',
              keyPath: 'id',
              autoIncrement: true,
              indices: [
                { name: 'date', keyPath: 'date' },
                { name: 'name', keyPath: 'name' },
                { name: 'task', keyPath: 'task' },
              ],
            },
          ],
        });
        setIsInitialized(true);
      } catch (error) {
        const errorObj = handleError(error);
        console.error('Failed to initialize database:', errorObj);
      }
    };

    initializeDatabase();
  }, [initDB, handleError]);

  // Generic CRUD operations
  const addWithTimestamps = useCallback(async <T extends Record<string, any>>(
    storeName: StoreName, 
    item: T
  ): Promise<IDBValidKey> => {
    if (!db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const itemWithTimestamps = {
      ...item,
      createdAt: now,
      updatedAt: now,
    };
    
    return add(storeName, itemWithTimestamps);
  }, [db, add]);
  
  const updateWithTimestamps = useCallback(async <T extends { id: IDBValidKey }>(
    storeName: StoreName, 
    id: IDBValidKey,
    updates: Partial<T>
  ): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    const existing = await get<T>(storeName, id);
    if (!existing) throw new Error(`${storeName.slice(0, -1)} not found`);
    
    const updatedItem = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await update(storeName, updatedItem);
  }, [db, get, update]);

  // Activity methods
  const addActivity = useCallback(async (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addWithTimestamps('activities', activity);
  }, [addWithTimestamps]);

  const getActivity = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    return get<Activity>('activities', id);
  }, [db, get]);

  const getActivities = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    return getAll<Activity>('activities');
  }, [db, getAll]);

  const updateActivity = useCallback(async (id: IDBValidKey, updates: Partial<Activity>) => {
    return updateWithTimestamps('activities', id, updates);
  }, [updateWithTimestamps]);

  const deleteActivity = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    await remove('activities', id);
  }, [db, remove]);

  // Inventory methods
  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addWithTimestamps('inventory', item);
  }, [addWithTimestamps]);

  const getInventoryItem = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    return get<InventoryItem>('inventory', id);
  }, [db, get]);

  const getInventoryItems = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    return getAll<InventoryItem>('inventory');
  }, [db, getAll]);

  const updateInventoryItem = useCallback(async (id: IDBValidKey, updates: Partial<InventoryItem>) => {
    return updateWithTimestamps('inventory', id, updates);
  }, [updateWithTimestamps]);

  const deleteInventoryItem = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    await remove('inventory', id);
  }, [db, remove]);

  // Sale methods
  const addSale = useCallback(async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'total'>) => {
    const total = sale.quantity * sale.pricePerUnit;
    return addWithTimestamps('sales', { ...sale, total });
  }, [addWithTimestamps]);

  const getSale = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    return get<Sale>('sales', id);
  }, [db, get]);

  const getSales = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    return getAll<Sale>('sales');
  }, [db, getAll]);

  const updateSale = useCallback(async (id: IDBValidKey, updates: Partial<Sale>) => {
    if (updates.quantity !== undefined || updates.pricePerUnit !== undefined) {
      const sale = await get<Sale>('sales', id);
      if (sale) {
        const quantity = updates.quantity ?? sale.quantity;
        const pricePerUnit = updates.pricePerUnit ?? sale.pricePerUnit;
        updates.total = quantity * pricePerUnit;
      }
    }
    
    return updateWithTimestamps('sales', id, updates);
  }, [get, updateWithTimestamps]);

  const deleteSale = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    await remove('sales', id);
  }, [db, remove]);

  // Expense methods
  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addWithTimestamps('expenses', expense);
  }, [addWithTimestamps]);

  const getExpense = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    return get<Expense>('expenses', id);
  }, [db, get]);

  const getExpenses = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    return getAll<Expense>('expenses');
  }, [db, getAll]);

  const updateExpense = useCallback(async (id: IDBValidKey, updates: Partial<Expense>) => {
    return updateWithTimestamps('expenses', id, updates);
  }, [updateWithTimestamps]);

  const deleteExpense = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    await remove('expenses', id);
  }, [db, remove]);

  // Labour methods
  const addLabour = useCallback(async (labour: Omit<Labour, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addWithTimestamps('labour', labour);
  }, [addWithTimestamps]);

  const getLabour = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    return get<Labour>('labour', id);
  }, [db, get]);

  const getLabours = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    return getAll<Labour>('labour');
  }, [db, getAll]);

  const updateLabour = useCallback(async (id: IDBValidKey, updates: Partial<Labour>) => {
    return updateWithTimestamps('labour', id, updates);
  }, [updateWithTimestamps]);

  const deleteLabour = useCallback(async (id: IDBValidKey) => {
    if (!db) throw new Error('Database not initialized');
    await remove('labour', id);
  }, [db, remove]);

  // Export/Import
  const exportData = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    
    const storeNames = Array.from(db.objectStoreNames) as StoreName[];
    const data: Record<string, any> = {};
    
    for (const storeName of storeNames) {
      data[storeName] = await getAll(storeName);
    }
    
    return data;
  }, [db, getAll]);
  
  const importData = useCallback(async (data: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    
    const tx = db.transaction(Array.from(db.objectStoreNames) as StoreName[], 'readwrite');
    
    for (const [storeName, items] of Object.entries(data)) {
      if (!db.objectStoreNames.contains(storeName)) continue;
      
      const store = tx.objectStore(storeName);
      await store.clear();
      
      if (Array.isArray(items)) {
        for (const item of items) {
          await store.add(item);
        }
      }
    }
    
    return tx.done;
  }, [db]);
  
  // Maintenance
  const clearAllData = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    
    const storeNames = Array.from(db.objectStoreNames) as StoreName[];
    
    for (const storeName of storeNames) {
      await clear(storeName);
    }
  }, [db, clear]);
  
  const rebuildIndexes = useCallback(async () => {
    // This would recreate the database with the same schema to rebuild indexes
    if (!db) throw new Error('Database not initialized');
    
    const currentVersion = db.version;
    db.close();
    
    const request = indexedDB.open(db.name, currentVersion + 1);
    
    return newPromise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        request.result.close();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        // Recreate all object stores and indexes here
        // This is a simplified version - in a real app, you'd want to preserve data
      };
    });
  }, [db]);

  const value = {
    // Core state
    isInitialized,
    error,
    db,
    
    // Generic methods
    add: addWithTimestamps,
    get,
    getAll,
    update: updateWithTimestamps,
    remove,
    clear,
    
    // Activity methods
    addActivity,
    getActivity,
    getActivities,
    updateActivity,
    deleteActivity,
    
    // Inventory methods
    addInventoryItem,
    getInventoryItem,
    getInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Sale methods
    addSale,
    getSale,
    getSales,
    updateSale,
    deleteSale,
    
    // Expense methods
    addExpense,
    getExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    
    // Labour methods
    addLabour,
    getLabour,
    getLabours,
    updateLabour,
    deleteLabour,
    
    // Export/Import
    exportData,
    importData,
    
    // Maintenance
    clearAllData,
    rebuildIndexes,
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

// Helper function to convert callback-based API to Promises
function newPromise<T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => void
): Promise<T> {
  return new Promise(executor);
}
