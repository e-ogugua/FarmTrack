'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Package, Cloud, Calculator, Activity, Leaf, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/utils/storage';
import { motion } from 'framer-motion';
import { useDatabase } from '@/contexts/DatabaseContext';

type DashboardStats = {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  inventoryItems: number;
};

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
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    inventoryItems: 0,
  });
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [tax, setTax] = useState<TaxSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useDatabase();

  const loadDashboardData = useCallback(async () => {
    // Load main stats
    interface Sale {
      total: number;
    }
    interface Expense {
      amount: number;
    }

    const sales = storage.get<Sale[]>('sales', []);
    const expenses = storage.get<Expense[]>('expenses', []);
    const inventory = storage.get<unknown[]>('inventory', []);

    const totalSales = sales.reduce((sum: number, sale: Sale) => sum + (sale?.total || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, expense: Expense) => sum + (expense?.amount || 0), 0);
    const profit = totalSales - totalExpenses;
    const inventoryItems = inventory.length;

    setStats({
      totalSales,
      totalExpenses,
      profit,
      inventoryItems,
    });

    // Load weather summary
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

    // Load tax summary
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
          <p className="text-muted-foreground font-medium">Loading your farm data...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Farm Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor your agricultural operations at a glance
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${stats.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">↗ +20.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <div className="p-2 bg-secondary/10 rounded-full">
                <TrendingDown className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${stats.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-red-600">↗ +5.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 bg-gradient-to-br from-card to-card/50 ${
            stats.profit >= 0 ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              <div className={`p-2 rounded-full ${
                stats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  stats.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                stats.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.profit >= 0 ? '+' : ''}${Math.abs(stats.profit).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.profit >= 0 ? 'Profit' : 'Loss'} this period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Items</CardTitle>
              <div className="p-2 bg-accent/10 rounded-full">
                <Package className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.inventoryItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items in stock
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-blue-50 rounded-full">
                  <Cloud className="h-5 w-5 text-blue-600" />
                </div>
                Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weather ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{weather.temperature}°C</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {weather.condition}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Optimal conditions for your crops
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No weather data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-purple-50 rounded-full">
                  <Calculator className="h-5 w-5 text-purple-600" />
                </div>
                Tax Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tax ? (
                <div className="space-y-3">
                  <div className="text-lg font-semibold text-foreground">
                    Taxable Income: <span className="text-primary">${tax.taxableIncome.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated Tax: <span className="font-medium">${tax.estimatedTax.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tax data for this year</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-green-50 rounded-full">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                Farm Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  All Systems Operational
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Your farm management system is running smoothly
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">No recent activities</p>
                    <p className="text-xs text-muted-foreground">Activities will appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-accent" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">No recent sales</p>
                    <p className="text-xs text-muted-foreground">Sales records will appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
