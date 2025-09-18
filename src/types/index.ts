// Activity types
export interface Activity {
  id: string;
  date: string;
  activityType: string;
  crop: string;
  notes: string;
  createdAt: string;
}

// Labour types
export interface Labour {
  id: string;
  date: string;
  name: string;
  task: string;
  hours: number;
  wage: number;
  total: number;
  notes: string;
  createdAt: string;
}

// Expense types
export interface Expense {
  id: string;
  date: string;
  item: string;
  category: string;
  amount: number;
  notes: string;
  createdAt: string;
}

// Sales types
export interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  notes: string;
  createdAt: string;
}

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
  supplier?: string;
  lastUpdated: string;
  notes?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  inventoryItems: number;
  recentActivities: Activity[];
  recentSales: Sale[];
}

// Form data types
export type ActivityFormData = Omit<Activity, 'id' | 'createdAt'>;
export type LabourFormData = Omit<Labour, 'id' | 'total' | 'createdAt'>;
export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt'>;
export type SaleFormData = Omit<Sale, 'id' | 'total' | 'createdAt'>;
export type InventoryFormData = Omit<InventoryItem, 'id' | 'lastUpdated'>;
