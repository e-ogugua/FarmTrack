# API Reference Documentation

## Data Storage API

FarmTrack implements a comprehensive data storage API for managing agricultural records across multiple domains.

### Core Storage Interface

```typescript
interface StorageAPI {
  // Add new record
  add<T>(storeName: StoreName, item: Omit<T, 'id'>): Promise<string>

  // Retrieve single record
  get<T>(storeName: StoreName, key: string): Promise<T | undefined>

  // Retrieve all records
  getAll<T>(storeName: StoreName): Promise<T[]>

  // Update existing record
  update<T>(storeName: StoreName, item: T): Promise<void>

  // Delete record
  remove(storeName: StoreName, key: string): Promise<void>

  // Clear all records from store
  clear(storeName: StoreName): Promise<void>
}
```

### Store Names

```typescript
type StoreName =
  | 'activities'
  | 'inventory'
  | 'sales'
  | 'expenses'
  | 'labour'
  | 'weather'
  | 'tax-records'
```

## Data Models

### Activity Records
```typescript
interface Activity {
  id: string
  date: string
  activityType: string
  crop: string
  notes?: string
  createdAt: string
}
```

### Inventory Items
```typescript
interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  pricePerUnit: number
  minimumStock: number
  supplier?: string
  notes?: string
  lastUpdated: string
}
```

### Sales Records
```typescript
interface Sale {
  id: string
  date: string
  product: string
  quantity: number
  pricePerUnit: number
  total: number
  customer: string
  notes?: string
  createdAt: string
}
```

### Expense Records
```typescript
interface Expense {
  id: string
  date: string
  category: string
  amount: number
  description: string
  paymentMethod: string
  receiptNumber?: string
  createdAt: string
}
```

### Labor Records
```typescript
interface Labor {
  id: string
  date: string
  employee: string
  hours: number
  rate: number
  total: number
  task: string
  notes?: string
  createdAt: string
}
```

### Weather Data
```typescript
interface WeatherData {
  id: string
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  icon: string
  forecast: Array<{
    date: string
    temp: number
    condition: string
  }>
}
```

### Tax Records
```typescript
interface TaxRecord {
  id: string
  year: number
  type: 'income' | 'expense' | 'deduction'
  amount: number
  description: string
  category: string
  createdAt: string
}
```

## Usage Examples

### Adding Records
```typescript
import { storage } from '@/lib/utils/storage';

// Add inventory item
const itemId = await storage.add('inventory', {
  name: 'Tomato Seeds',
  category: 'seeds',
  quantity: 100,
  unit: 'kg',
  pricePerUnit: 25.50,
  minimumStock: 10
});

// Add activity record
const activityId = await storage.add('activities', {
  date: '2024-01-15',
  activityType: 'Planting',
  crop: 'Tomatoes',
  notes: 'Planted 50 seedlings'
});
```

### Retrieving Records
```typescript
// Get all inventory items
const inventory = await storage.getAll('inventory');

// Get specific item
const item = await storage.get('inventory', itemId);

// Get sales for specific date range
const sales = await storage.getAll('sales').then(sales =>
  sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    return saleDate >= startDate && saleDate <= endDate;
  })
);
```

### Updating Records
```typescript
// Update inventory item
await storage.update('inventory', {
  id: itemId,
  name: 'Premium Tomato Seeds',
  quantity: 95, // Reduced quantity
  lastUpdated: new Date().toISOString()
});
```

### Deleting Records
```typescript
// Remove specific record
await storage.remove('activities', activityId);

// Clear all records from store
await storage.clear('expenses');
```

## Error Handling

### Error Types
```typescript
interface StorageError {
  code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'STORAGE_ERROR'
  message: string
  details?: any
}
```

### Error Handling Patterns
```typescript
try {
  const items = await storage.getAll('inventory');
} catch (error) {
  if (error.code === 'STORAGE_ERROR') {
    // Handle storage-specific errors
    console.error('Storage operation failed:', error.message);
  }
  // Handle other errors
}
```

## Performance Considerations

### Batch Operations
```typescript
// For multiple operations, consider batching
const operations = items.map(item =>
  storage.update('inventory', item)
);

// Execute operations sequentially to avoid conflicts
for (const operation of operations) {
  await operation;
}
```

### Data Filtering
```typescript
// Filter data at the application level for better performance
const activeItems = await storage.getAll('inventory').then(items =>
  items.filter(item => item.quantity > 0)
);
```

### Memory Management
```typescript
// For large datasets, consider pagination
const getInventoryPage = async (page: number, pageSize: number) => {
  const allItems = await storage.getAll('inventory');
  const start = page * pageSize;
  const end = start + pageSize;
  return allItems.slice(start, end);
};
```

## Data Migration

### Version Management
```typescript
// Check database version
const currentVersion = await storage.getVersion?.();

// Migrate data structure
if (currentVersion < 2) {
  await migrateToVersion2();
}
```

### Backup and Export
```typescript
// Export all data
const exportData = async () => {
  const data = {
    inventory: await storage.getAll('inventory'),
    sales: await storage.getAll('sales'),
    expenses: await storage.getAll('expenses'),
    activities: await storage.getAll('activities')
  };

  // Download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'farmtrack-backup.json';
  a.click();
};
```

---

**Developed by CEO – Chukwuka Emmanuel Ogugua**

*FarmTrack – An EmmanuelOS Agricultural Module*
