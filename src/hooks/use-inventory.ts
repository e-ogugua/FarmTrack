import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { InventoryItem } from '@/types';

const STORE_NAME = 'inventory' as const;

export function useInventory() {
  const { 
    isInitialized, 
    add,
    getAll,
    update,
    remove
  } = useDatabase();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get all inventory items
  const getInventoryItems = useCallback(async (): Promise<InventoryItem[]> => {
    if (!isInitialized) return [];
    try {
      return await getAll<InventoryItem>(STORE_NAME);
    } catch (err) {
      console.error('Failed to get inventory items:', err);
      throw err;
    }
  }, [isInitialized, getAll]);

  // Load inventory from the database
  const loadInventory = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setIsLoading(true);
      const data = await getInventoryItems();
      setInventory(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(err instanceof Error ? err : new Error('Failed to load inventory'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, getInventoryItems]);

  // Initial load
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Add a new inventory item
  const addNewInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const now = new Date().toISOString();
      const newItem = {
        ...itemData,
        createdAt: now,
        updatedAt: now,
      };
      
      const id = await add<InventoryItem>(STORE_NAME, newItem);
      await loadInventory(); // Refresh the list
      return id;
    } catch (err) {
      console.error('Failed to add inventory item:', err);
      throw err;
    }
  };

  // Update an existing inventory item
  const updateExistingItem = useCallback(async (id: IDBValidKey, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      // First get the existing item
      const allItems = await getInventoryItems();
      const existingItem = allItems.find(item => item.id === id);
      
      if (!existingItem) {
        throw new Error('Inventory item not found');
      }
      
      // Merge updates with existing item
      const updatedItem = {
        ...existingItem,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await update<InventoryItem>(STORE_NAME, updatedItem);
      await loadInventory(); // Refresh the list
    } catch (err) {
      console.error('Failed to update inventory item:', err);
      throw err;
    }
  }, [isInitialized, getInventoryItems, update, loadInventory]);

  // Delete an inventory item
  const removeInventoryItem = async (id: IDBValidKey) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      await remove(STORE_NAME, id);
      await loadInventory(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
      throw err;
    }
  };

  // Get inventory items by category
  const getItemsByCategory = useCallback(async (category: string) => {
    if (!isInitialized) return [];
    
    try {
      const allItems = await getInventoryItems();
      return allItems.filter(item => item.category === category);
    } catch (err) {
      console.error(`Failed to get inventory items in category ${category}:`, err);
      return [];
    }
  }, [isInitialized, getInventoryItems]);

  // Get low stock items (quantity below threshold)
  const getLowStockItems = useCallback(async (threshold: number = 10) => {
    if (!isInitialized) return [];
    
    try {
      const allItems = await getInventoryItems();
      return allItems.filter(item => item.quantity <= threshold);
    } catch (err) {
      console.error('Failed to get low stock items:', err);
      return [];
    }
  }, [isInitialized, getInventoryItems]);

  // Update inventory quantity (add or subtract)
  const updateItemQuantity = useCallback(async (id: IDBValidKey, change: number) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const items = await getInventoryItems();
      const item = items.find(i => i.id === id);
      
      if (!item) {
        throw new Error('Item not found');
      }
      
      const newQuantity = item.quantity + change;
      if (newQuantity < 0) {
        throw new Error('Insufficient quantity');
      }
      
      await updateExistingItem(id, { quantity: newQuantity });
    } catch (err) {
      console.error('Failed to update item quantity:', err);
      throw err;
    }
  }, [isInitialized, getInventoryItems, updateExistingItem]);

  return {
    inventory,
    isLoading,
    error,
    addItem: addNewInventoryItem,
    updateItem: updateExistingItem,
    deleteItem: removeInventoryItem,
    getItemsByCategory,
    getLowStockItems,
    updateItemQuantity,
    refresh: loadInventory,
  };
}
