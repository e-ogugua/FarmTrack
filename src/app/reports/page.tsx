'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { storage } from '@/lib/utils/storage';

// Dynamic import for reports content to enable code splitting
const ReportsContent = dynamic(() => import('@/components/reports/ReportsContent'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground font-medium">Loading reports...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for client-side reports functionality
});

// Type definitions
interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  customer: string;
  notes?: string;
  createdAt: string;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  receiptNumber?: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  minimumStock: number;
  supplier?: string;
  notes?: string;
  lastUpdated: string;
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    const storedSales = storage.get<Sale[]>('sales', []);
    const storedExpenses = storage.get<Expense[]>('expenses', []);
    const storedInventory = storage.get<InventoryItem[]>('inventory', []);

    setSales(storedSales);
    setExpenses(storedExpenses);
    setInventory(storedInventory);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Loading reports data...</p>
        </div>
      </div>
    );
  }

  return <ReportsContent sales={sales} expenses={expenses} inventory={inventory} />;
}
