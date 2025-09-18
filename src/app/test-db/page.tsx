'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { Button } from '@/components/ui/button';

interface TestItem {
  id: IDBValidKey;
  name: string;
  value: number;
  createdAt: string;
  updatedAt?: string;
}

export default function TestDBPage() {
  const { isInitialized, add, getAll, update, remove, clear } = useDatabase();
  const [items, setItems] = useState<TestItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<TestItem, 'id'>>({ 
    name: '', 
    value: 0,
    createdAt: new Date().toISOString()
  });
  const [status, setStatus] = useState<string>('');

  // Load all items on initialization
  const loadItems = useCallback(async () => {
    try {
      const allItems = await getAll<TestItem>('inventory');
      setItems(allItems || []);
      setStatus(`Loaded ${allItems?.length || 0} items`);
    } catch (error) {
      setStatus(`Error loading items: ${error}`);
      console.error('Error loading items:', error);
    }
  }, [getAll]);

  useEffect(() => {
    if (isInitialized) {
      loadItems();
    }
  }, [isInitialized, loadItems]);


  const handleAddItem = async () => {
    if (!newItem.name) return;
    
    try {
      const id = await add<TestItem>('inventory', newItem);
      setStatus(`Added item with id: ${String(id)}`);
      setNewItem({ 
        name: '', 
        value: 0,
        createdAt: new Date().toISOString()
      });
      await loadItems();
    } catch (error) {
      setStatus(`Error adding item: ${error}`);
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async (item: TestItem) => {
    if (!item.id) return;
    
    try {
      await update<TestItem>('inventory', {
        ...item,
        value: (item.value || 0) + 1
      });
      setStatus(`Updated item ${item.id}`);
      await loadItems();
    } catch (error) {
      setStatus(`Error updating item: ${error}`);
      console.error('Error updating item:', error);
    }
  };

  const handleRemoveItem = async (id: IDBValidKey) => {
    try {
      await remove('inventory', id);
      setStatus(`Removed item ${id}`);
      await loadItems();
    } catch (error) {
      setStatus(`Error removing item: ${error}`);
      console.error('Error removing item:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clear('inventory');
      setStatus('Cleared all items');
      await loadItems();
    } catch (error) {
      setStatus(`Error clearing items: ${error}`);
      console.error('Error clearing items:', error);
    }
  };

  if (!isInitialized) {
    return <div>Initializing database...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add New Item</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Name"
            className="p-2 border rounded"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          />
          <input
            type="number"
            placeholder="Value"
            className="p-2 border rounded w-24"
            value={newItem.value}
            onChange={(e) => setNewItem({...newItem, value: Number(e.target.value)})}
          />
          <Button onClick={handleAddItem}>Add Item</Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Items ({items.length})</h2>
          <Button variant="outline" onClick={handleClearAll} disabled={items.length === 0}>
            Clear All
          </Button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-gray-500">No items found</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <div key={String(item.id)} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-sm text-gray-600">(Value: {item.value})</span>
                  <div className="text-xs text-gray-500">
                    {item.createdAt && `Created: ${new Date(item.createdAt).toLocaleString()}`}
                    {item.updatedAt && ` • Updated: ${new Date(item.updatedAt).toLocaleString()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateItem(item)}
                  >
                    Increment
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </ul>
        )}
      </div>

      {status && (
        <div className="p-2 bg-blue-50 text-blue-700 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
