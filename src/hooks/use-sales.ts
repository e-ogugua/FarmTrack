import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { Sale } from '@/types';

export function useSales() {
  const { 
    isInitialized, 
    add: addSale, 
    getAll: getSales, 
    update: updateSale, 
    remove: deleteSale 
  } = useDatabase();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load sales from the database
  const loadSales = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setIsLoading(true);
      const data = await getSales('sales');
      setSales(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load sales:', err);
      setError(err instanceof Error ? err : new Error('Failed to load sales'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, getSales]);

  // Initial load
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Add a new sale
  const addNewSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const now = new Date().toISOString();
      const newSale = {
        ...saleData,
        total: saleData.quantity * saleData.pricePerUnit,
        createdAt: now,
        updatedAt: now,
      };
      
      const id = await addSale('sales', newSale);
      await loadSales(); // Refresh the list
      return id;
    } catch (err) {
      console.error('Failed to add sale:', err);
      throw err;
    }
  };

  // Update an existing sale
  const updateExistingSale = useCallback(async (id: IDBValidKey, updates: Partial<Omit<Sale, 'id' | 'createdAt' | 'total'>>) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const updatedData: Partial<Sale> = { ...updates };
      
      // Recalculate total if quantity or price changes
      if (updates.quantity !== undefined || updates.pricePerUnit !== undefined) {
        const sale = sales.find(s => s.id === id);
        if (sale) {
          const quantity = updates.quantity ?? sale.quantity;
          const pricePerUnit = updates.pricePerUnit ?? sale.pricePerUnit;
          updatedData.total = quantity * pricePerUnit;
        }
      }
      
      await updateSale('sales', id, updatedData);
      await loadSales(); // Refresh the list
    } catch (err) {
      console.error('Failed to update sale:', err);
      throw err;
    }
  }, [isInitialized, sales, updateSale, loadSales]);

  // Delete a sale
  const removeSale = useCallback(async (id: IDBValidKey) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      await deleteSale('sales', id);
      await loadSales(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete sale:', err);
      throw err;
    }
  }, [isInitialized, deleteSale, loadSales]);

  // Get sales by date range
  const getSalesByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isInitialized) return [];
    
    try {
      const allSales = await getSales('sales');
      return allSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
      });
    } catch (err) {
      console.error('Failed to filter sales by date:', err);
      return [];
    }
  }, [isInitialized, getSales]);

  // Get sales by product
  const getSalesByProduct = useCallback(async (product: string) => {
    if (!isInitialized) return [];
    
    try {
      const allSales = await getSales('sales');
      return allSales.filter(sale => sale.product === product);
    } catch (err) {
      console.error(`Failed to get sales for product ${product}:`, err);
      return [];
    }
  }, [isInitialized, getSales]);

  // Get total sales amount
  const getTotalSales = useCallback(async (salesData?: Sale[]) => {
    const dataToUse = salesData || sales;
    if (!dataToUse || dataToUse.length === 0) return 0;
    return dataToUse.reduce((sum, sale) => sum + (sale.total || 0), 0);
  }, [sales]);

  // Get sales summary by product
  const getSalesSummaryByProduct = useCallback(async () => {
    if (!isInitialized) return [];
    
    try {
      const allSales = await getSales('sales');
      const summary = new Map<string, { product: string; totalQuantity: number; totalRevenue: number }>();
      
      allSales.forEach(sale => {
        const existing = summary.get(sale.product) || { 
          product: sale.product, 
          totalQuantity: 0, 
          totalRevenue: 0 
        };
        
        summary.set(sale.product, {
          product: sale.product,
          totalQuantity: existing.totalQuantity + sale.quantity,
          totalRevenue: existing.totalRevenue + (sale.total || 0)
        });
      });
      
      return Array.from(summary.values());
    } catch (err) {
      console.error('Failed to generate sales summary:', err);
      return [];
    }
  }, [isInitialized, getSales]);

  return {
    sales,
    isLoading,
    error,
    addSale: addNewSale,
    updateSale: updateExistingSale,
    deleteSale: removeSale,
    getSalesByDateRange,
    getSalesByProduct,
    getTotalSales,
    getSalesSummaryByProduct,
    refresh: loadSales,
  };
}
