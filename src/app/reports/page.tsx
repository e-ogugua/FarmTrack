'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay } from 'date-fns';
import { formatDate } from '@/lib/date-utils';
import { storage } from '@/lib/utils/storage';

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

interface Activity {
  id: string;
  date: string;
  activityType: string;
  crop: string;
  notes?: string;
  createdAt: string;
}

type ReportData = {
  sales: Sale[];
  expenses: Expense[];
  inventory: InventoryItem[];
  activities: Activity[];
};

// Type for sales data point
interface SalesDataPoint {
  date: string;
  total: number;
  count: number;
  avgSale: number;
  sales: number;
}

// Type for expense data point
interface ExpenseDataPoint {
  month: string;
  total: number;
  [category: string]: string | number;
}

// Type for inventory data point
interface InventoryDataPoint {
  [key: string]: string | number | InventoryItem[] | undefined;
  name: string;
  value: number;
  items?: InventoryItem[];
}


// Type for time period selection
type TimePeriod = '7days' | '30days' | '90days' | 'year' | 'all' | 'thisMonth' | 'lastMonth' | 'custom';




const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Helper function to generate sales data for charts
const generateSalesData = (sales: Sale[], dateRange: { from: Date; to: Date }): SalesDataPoint[] => {
  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to
  });

  return days.map(day => {
    const daySales = sales.filter(sale => isSameDay(new Date(sale.date), day));
    const total = daySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const count = daySales.length;
    const avgSale = count > 0 ? total / count : 0;

    return {
      date: format(day, 'MMM d'),
      total,
      count,
      avgSale,
      sales: total
    };
  });
};

// Helper function to generate expense data for charts
const generateExpenseData = (expenses: Expense[], dateRange: { from: Date; to: Date }): ExpenseDataPoint[] => {
  interface ExpenseData {
    total: number;
    categories: Record<string, number>;
  }
  
  const months: Record<string, ExpenseData> = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    if (!isWithinInterval(date, { start: dateRange.from, end: dateRange.to })) return;
    
    const monthKey = format(date, 'MMM yyyy');
    if (!months[monthKey]) {
      months[monthKey] = { total: 0, categories: {} };
    }
    
    months[monthKey].total += expense.amount;
    months[monthKey].categories[expense.category] = (months[monthKey].categories[expense.category] || 0) + expense.amount;
  });

  return Object.entries(months).map(([month, data]) => ({
    month,
    ...data.categories,
    total: data.total
  }));
};

// Helper function to generate inventory data for charts
const generateInventoryData = (inventory: InventoryItem[]): InventoryDataPoint[] => {
  const categories = inventory.reduce<Record<string, { value: number; items: InventoryItem[] }>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { value: 0, items: [] };
    }
    acc[item.category].value += item.quantity * item.pricePerUnit;
    acc[item.category].items.push(item);
    return acc;
  }, {});

  return Object.entries(categories).map(([name, data]) => ({
    name,
    value: data.value,
    items: data.items
  }));
};


// Main Reports Page Component
export default function ReportsPage() {
  const [, setData] = useState<ReportData>({
    sales: [],
    expenses: [],
    inventory: [],
    activities: []
  });
  
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  
  // Tab state is managed by the Tabs component
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');
  const [salesChartType, setSalesChartType] = useState<'bar' | 'line'>('bar');
  const [expenseChartType, setExpenseChartType] = useState<'bar' | 'pie'>('bar');
  const [reportData, setReportData] = useState<ReportData>({
    sales: [],
    expenses: [],
    inventory: [],
    activities: []
  });

  // Load data from storage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const sales = await storage.get<Sale[]>('sales', []);
        const expenses = await storage.get<Expense[]>('expenses', []);
        const inventory = await storage.get<InventoryItem[]>('inventory', []);
        const activities = await storage.get<Activity[]>('activities', []);

        setData({ 
          sales: sales || [], 
          expenses: expenses || [], 
          inventory: inventory || [], 
          activities: activities || [] 
        });
        setReportData({ 
          sales: sales || [], 
          expenses: expenses || [], 
          inventory: inventory || [], 
          activities: activities || [] 
        });
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update date range when time period changes
  useEffect(() => {
    const now = new Date();
    let fromDate: Date = new Date(2000, 0, 1); // Default to very old date

    if (timePeriod === '7days') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === '30days') {
      fromDate = subMonths(now, 1);
    } else if (timePeriod === '90days') {
      fromDate = subMonths(now, 3);
    } else if (timePeriod === 'year') {
      fromDate = subMonths(now, 12);
    } else if (timePeriod === 'thisMonth') {
      fromDate = startOfMonth(now);
    } else if (timePeriod === 'lastMonth') {
      fromDate = startOfMonth(subMonths(now, 1));
      const toDate = endOfMonth(subMonths(now, 1));
      setDateRange({ from: fromDate, to: toDate });
      return;
    } else if (timePeriod === 'custom') {
      // Custom date range is handled separately
      return;
    }
    
    setDateRange({
      from: fromDate,
      to: now
    });
  }, [timePeriod]);

  // Process data for charts
  const salesData = generateSalesData(reportData.sales, dateRange);
  const expenseData = generateExpenseData(reportData.expenses, dateRange);
  const inventoryData = generateInventoryData(reportData.inventory);
  // Remove unused activityData since we're not using it
  
  // Calculate totals
  const totalSales = salesData.reduce((sum, day) => sum + day.total, 0);
  const totalExpenses = expenseData.reduce((sum, month) => sum + month.total, 0);
  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.value, 0);
  

  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
    if (['7days', '30days', '90days', 'year', 'all', 'custom', 'thisMonth', 'lastMonth'].includes(value)) {
      setTimePeriod(value as TimePeriod);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading reports...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Analyze your farm&apos;s performance and trends</p>
      </div>
      
      {/* Date Range Picker */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Track your farm&apos;s sales performance</CardDescription>
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
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="lastMonth">Last month</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
              
              {(timePeriod === 'custom' || timePeriod === 'thisMonth' || timePeriod === 'lastMonth') && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      setDateRange(prev => ({ ...prev, from: date }));
                    }}
                    max={dateRange.to.toISOString().split('T')[0]}
                    className="border rounded p-2"
                  />
                  <span className="flex items-center">to</span>
                  <input
                    type="date"
                    value={dateRange.to.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      setDateRange(prev => ({ ...prev, to: date }));
                    }}
                    min={dateRange.from.toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current total value</p>
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
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2
          ">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>
                    Track your sales over time
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={salesChartType === 'bar' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setSalesChartType('bar')}
                  >
                    <BarChartIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={salesChartType === 'line' ? 'default' : 'outline'} 
                    size="icon"
                    onClick={() => setSalesChartType('line')}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {salesChartType === 'bar' ? (
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" name="Sales ($)" fill="#8884d8" />
                      <Bar dataKey="transactions" name="Transactions" fill="#82ca9d" />
                    </BarChart>
                  ) : (
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        name="Sales ($)" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="transactions" 
                        name="Transactions" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No sales data available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.sales.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      reportData.sales.reduce((acc, sale) => {
                        if (!acc[sale.product]) {
                          acc[sale.product] = 0;
                        }
                        acc[sale.product] += sale.quantity;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([product, quantity]) => (
                        <div key={product} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{product}</span>
                          <span className="text-sm text-muted-foreground">{quantity} units</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No sales data available.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.sales.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      reportData.sales.reduce((acc, sale) => {
                        if (!sale.customer) return acc;
                        if (!acc[sale.customer]) {
                          acc[sale.customer] = 0;
                        }
                        acc[sale.customer] += sale.quantity * sale.pricePerUnit;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([customer, amount]) => (
                        <div key={customer} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{customer}</span>
                          <span className="text-sm text-muted-foreground">${amount.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No customer data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Analyze your expenses by category
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={expenseChartType === 'pie' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setExpenseChartType('pie')}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={expenseChartType === 'bar' ? 'default' : 'outline'} 
                    size="icon"
                    onClick={() => setExpenseChartType('bar')}
                  >
                    <BarChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {expenseChartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: $${Number(value).toFixed(2)}`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => 
                          [`$${Number(value).toFixed(2)}`, 'Amount']
                        }
                      />
                      <Legend />
                    </PieChart>
                  ) : (
                    <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => 
                          [`$${Number(value).toFixed(2)}`, 'Amount']
                        }
                      />
                      <Bar dataKey="value" name="Amount ($)">
                        {expenseData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No expense data available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.expenses.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.expenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              {expense.category}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {expense.description || 'No description'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              ${expense.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(expense.date, 'MMM d')}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No expense records found.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Expenses</span>
                    <span className="text-sm font-medium">${totalExpenses.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">By Category:</div>
                    {Object.entries(
                      expenseData.reduce<Record<string, number>>((acc, curr) => {
                        // Skip the 'month' and 'total' properties
                        if (typeof curr === 'object' && curr !== null) {
                          Object.entries(curr).forEach(([key, value]) => {
                            if (key !== 'month' && key !== 'total' && typeof value === 'number') {
                              acc[key] = (acc[key] || 0) + value;
                            }
                          });
                        }
                        return acc;
                      }, {})
                    )
                      .map(([name, value]) => ({ name, value }))
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => (
                        <div key={category.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category.name}</span>
                            <span>${Number(category.value).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{
                                width: `${(Number(category.value) / Number(totalExpenses)) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value by Category</CardTitle>
              <CardDescription>
                Breakdown of your inventory value across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {inventoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name = '', percent = 0 }) => {
                        const percentValue = percent as number;
                        return `${name}: ${(percentValue * 100).toFixed(0)}%`;
                      }}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => 
                        [`$${Number(value).toFixed(2)}`, 'Value']
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No inventory data available.
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>
                  Items that need to be restocked soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.inventory.filter(item => 
                  item.minimumStock > 0 && item.quantity <= item.minimumStock
                ).length > 0 ? (
                  <div className="space-y-4">
                    {reportData.inventory
                      .filter(item => item.minimumStock > 0 && item.quantity <= item.minimumStock)
                      .sort((a, b) => (a.quantity / a.minimumStock) - (b.quantity / b.minimumStock))
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.category}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-600">
                              {item.quantity} {item.unit} left
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Min: {item.minimumStock} {item.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No low stock items. Good job!
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Items</span>
                    <span className="text-sm font-medium">{reportData.inventory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="text-sm font-medium">${totalInventoryValue.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="text-sm font-medium">Items by Category:</div>
                    {inventoryData
                      .sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0))
                      .map((category, index) => (
                        <div key={category.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category.name}</span>
                            <span>{category.items?.length || 0} items</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{
                                width: `${((category.items?.length || 0) / (reportData.inventory.length || 1)) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Track your farm activities and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.activities.length > 0 ? (
                <div className="space-y-4">
                  {reportData.activities
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((activity) => (
                      <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between">
                          <div className="font-medium">{activity.activityType}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(activity.date, 'MMM d, yyyy')}
                          </div>
                        </div>
                        {activity.crop && (
                          <div className="text-sm text-muted-foreground">
                            Crop: {activity.crop}
                          </div>
                        )}
                        {activity.notes && (
                          <p className="text-sm mt-1">{activity.notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No activities recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.activities.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Activities</span>
                      <span className="text-sm font-medium">{reportData.activities.length}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Activities by Type:</div>
                      {Object.entries(
                        reportData.activities.reduce((acc, activity) => {
                          if (!acc[activity.activityType]) {
                            acc[activity.activityType] = 0;
                          }
                          acc[activity.activityType]++;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .map(([type, count], index) => (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{type}</span>
                              <span>{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full" 
                                style={{
                                  width: `${(count / reportData.activities.length) * 100}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No activity data available.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Crop Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.activities.some(a => a.crop) ? (
                  <div className="space-y-4">
                    {Object.entries(
                      reportData.activities
                        .filter(a => a.crop)
                        .reduce((acc, activity) => {
                          if (!acc[activity.crop]) {
                            acc[activity.crop] = [];
                          }
                          acc[activity.crop].push(activity);
                          return acc;
                        }, {} as Record<string, Activity[]>)
                    )
                      .sort((a, b) => b[1].length - a[1].length)
                      .slice(0, 3)
                      .map(([crop, activities]) => (
                        <div key={crop} className="space-y-2">
                          <div className="font-medium">{crop}</div>
                          <div className="text-sm text-muted-foreground">
                            {activities.length} activities
                          </div>
                          <div className="text-xs space-y-1">
                            {activities
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .slice(0, 2)
                              .map(activity => (
                                <div key={activity.id} className="flex justify-between">
                                  <span>{activity.activityType}</span>
                                  <span>{formatDate(activity.date, 'MMM d')}</span>
                                </div>
                              ))}
                            {activities.length > 2 && (
                              <div className="text-muted-foreground">
                                +{activities.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No crop activities recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
