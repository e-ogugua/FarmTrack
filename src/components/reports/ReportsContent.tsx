import React, { useState, useMemo, useCallback } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

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

interface ReportsContentProps {
  sales: Sale[];
  expenses: Expense[];
  inventory: InventoryItem[];
}

export default React.memo(function ReportsContent({
  sales,
  expenses,
  inventory,
}: ReportsContentProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [timePeriod, setTimePeriod] = useState<string>('30days');

  // Memoize filtered data based on date range
  const filteredSales = useMemo(() =>
    sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= dateRange.from && saleDate <= dateRange.to;
    }),
    [sales, dateRange]
  );

  const filteredExpenses = useMemo(() =>
    expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
    }),
    [expenses, dateRange]
  );

  // Calculate totals
  const totalSales = useMemo(() =>
    filteredSales.reduce((sum, sale) => sum + sale.total, 0),
    [filteredSales]
  );

  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const totalInventoryValue = useMemo(() =>
    inventory.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0),
    [inventory]
  );

  // Handle time period change
  const handleTimePeriodChange = useCallback((value: string) => {
    setTimePeriod(value);
    const now = new Date();
    let fromDate: Date = new Date(2000, 0, 1);

    switch (value) {
      case '7days':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    setDateRange({ from: fromDate, to: now });
  }, []);

  return (
    <div className="container-wide p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-heading-2 text-foreground">Reports & Analytics</h1>
        <p className="text-body text-muted-foreground">
          Analyze your farm&apos;s performance and trends
        </p>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-responsive-lg">Analytics Overview</CardTitle>
              <CardDescription className="text-responsive-sm">
                Track your farm&apos;s performance over time
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="card-grid-stats">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-responsive-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-responsive-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-responsive-xs text-muted-foreground">
              {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-responsive-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-responsive-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-responsive-xs text-muted-foreground">
              {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-responsive-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-responsive-2xl font-bold ${totalSales - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalSales - totalExpenses).toFixed(2)}
            </div>
            <p className="text-responsive-xs text-muted-foreground">
              {totalSales - totalExpenses >= 0 ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-responsive-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-responsive-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-responsive-xs text-muted-foreground">Current total value</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 touch-target">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 touch-target" disabled>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-responsive-lg">Sales Performance</CardTitle>
              <CardDescription className="text-responsive-sm">
                Track your sales over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-responsive-lg font-semibold">
                  Total Sales: <span className="text-primary">${totalSales.toFixed(2)}</span>
                </div>
                <div className="text-responsive-sm text-muted-foreground">
                  Number of transactions: {filteredSales.length}
                </div>
                <div className="text-responsive-sm text-muted-foreground">
                  Average sale: ${filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : '0.00'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-responsive-lg">Expense Breakdown</CardTitle>
              <CardDescription className="text-responsive-sm">
                Analyze your expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-responsive-lg font-semibold">
                  Total Expenses: <span className="text-red-600">${totalExpenses.toFixed(2)}</span>
                </div>
                <div className="text-responsive-sm text-muted-foreground">
                  Number of expenses: {filteredExpenses.length}
                </div>
                <div className="text-responsive-sm text-muted-foreground">
                  Average expense: ${filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : '0.00'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-responsive-lg">Inventory Analysis</CardTitle>
              <CardDescription className="text-responsive-sm">
                Current inventory status and valuation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-responsive-lg font-semibold">
                  Total Inventory Value: <span className="text-primary">${totalInventoryValue.toFixed(2)}</span>
                </div>
                <div className="text-responsive-sm text-muted-foreground">
                  Total items: {inventory.length}
                </div>
                <div className="text-responsive-sm text-muted-foreground">
                  Low stock items: {inventory.filter(item => item.quantity <= item.minimumStock && item.minimumStock > 0).length}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
