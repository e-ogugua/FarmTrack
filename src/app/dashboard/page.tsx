'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDatabase } from '@/contexts/DatabaseContext';

// Dynamic imports for heavy components to enable code splitting
const DashboardContent = dynamic(() => import('@/components/dashboard/DashboardContent'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground font-medium">Loading dashboard...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for client-side only dashboard
});

type WeatherSummary = {
  temperature: number;
  condition: string;
};

type TaxSummary = {
  taxableIncome: number;
  estimatedTax: number;
};

type TaxRecord = {
  id: string;
  year: number;
  type: 'income' | 'expense' | 'deduction';
  category: string;
  amount: number;
  description: string;
  date: string;
};

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [tax, setTax] = useState<TaxSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useDatabase();

  const loadDashboardData = useCallback(async () => {
    // Using dynamic import to defer weather data loading for faster initial render
    try {
      const weatherData = await getAll('weather') as Array<{ temperature: number; condition: string }>;
      if (weatherData.length > 0) {
        setWeather({
          temperature: weatherData[0].temperature,
          condition: weatherData[0].condition,
        });
      }
    } catch (err) {
      console.error('Error loading weather:', err);
    }

    // Async tax calculations to prevent blocking main thread
    try {
      const taxData = await getAll('tax-records') as TaxRecord[];
      const currentYear = new Date().getFullYear();
      const yearRecords = taxData.filter((r) => r.year === currentYear);
      const totalIncome = yearRecords
        .filter((r) => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);
      const totalExpensesTax = yearRecords
        .filter((r) => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);
      const totalDeductions = yearRecords
        .filter((r) => r.type === 'deduction')
        .reduce((sum, r) => sum + r.amount, 0);
      const taxableIncome = Math.max(0, totalIncome - totalExpensesTax - totalDeductions);
      const estimatedTax = taxableIncome * 0.15;

      setTax({
        taxableIncome,
        estimatedTax,
      });
    } catch (err) {
      console.error('Error loading tax data:', err);
    }

    setIsLoading(false);
  }, [getAll]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Loading operational data...</p>
        </div>
      </div>
    );
  }

  return <DashboardContent stats={{ totalSales: 0, totalExpenses: 0, profit: 0, inventoryItems: 0 }} weather={weather} tax={tax} />;
}
