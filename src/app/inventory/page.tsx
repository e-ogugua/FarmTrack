'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Search, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/date-utils';
import { storage } from '@/lib/utils/storage';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  supplier?: string;
  lastUpdated: string;
  minimumStock: number;
  notes?: string;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'>>({ 
    name: '',
    category: 'seeds',
    quantity: 0,
    unit: 'kg',
    pricePerUnit: 0,
    supplier: '',
    minimumStock: 0,
    notes: ''
  });

  // Inventory categories
  const categories = [
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'tools', label: 'Tools & Equipment' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'other', label: 'Other' },
  ];

  // Units of measurement
  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (L)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'units', label: 'Units' },
    { value: 'bags', label: 'Bags' },
    { value: 'boxes', label: 'Boxes' },
  ];

  // Load inventory from localStorage
  useEffect(() => {
    const storedInventory = storage.get<InventoryItem[]>('inventory', []);
    setInventory(storedInventory);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'pricePerUnit' || name === 'minimumStock' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    if (editingId) {
      // Update existing item
      const updatedInventory = inventory.map(item => 
        item.id === editingId 
          ? { ...formData, id: editingId, lastUpdated: now }
          : item
      );
      setInventory(updatedInventory);
      storage.set('inventory', updatedInventory);
      setEditingId(null);
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...formData,
        lastUpdated: now
      };
      
      const updatedInventory = [...inventory, newItem];
      setInventory(updatedInventory);
      storage.set('inventory', updatedInventory);
    }
    
    // Reset form
    setFormData({
      name: '',
      category: 'seeds',
      quantity: 0,
      unit: 'kg',
      pricePerUnit: 0,
      supplier: '',
      minimumStock: 0,
      notes: ''
    });
    
    setIsFormOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      supplier: item.supplier || '',
      minimumStock: item.minimumStock,
      notes: item.notes || ''
    });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    storage.set('inventory', updatedInventory);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate inventory value
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.quantity * item.pricePerUnit), 0
  );

  // Find items that need restocking
  const lowStockItems = inventory.filter(item => 
    item.quantity <= item.minimumStock && item.minimumStock > 0
  );

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage your farm's inventory</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.length > 0 
                ? formatDate(Math.max(...inventory.map(i => new Date(i.lastUpdated).getTime())))
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Most recent update</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No inventory items found. Add your first item to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const category = categories.find(cat => cat.value === item.category)?.label || item.category;
              const unit = units.find(u => u.value === item.unit)?.label || item.unit;
              const isLowStock = item.quantity <= item.minimumStock && item.minimumStock > 0;
              
              return (
                <Card key={item.id} className={isLowStock ? 'border-red-200 dark:border-red-900' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {category} • {unit}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {item.quantity} {item.unit}
                        </div>
                        {isLowStock && (
                          <div className="text-xs text-red-500 font-medium">
                            Low Stock
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Price/Unit</div>
                        <div>${item.pricePerUnit.toFixed(2)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Total Value</div>
                        <div>${(item.quantity * item.pricePerUnit).toFixed(2)}</div>
                      </div>
                      {item.minimumStock > 0 && (
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Min. Stock</div>
                          <div>{item.minimumStock} {item.unit}</div>
                        </div>
                      )}
                      {item.supplier && (
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Supplier</div>
                          <div className="truncate">{item.supplier}</div>
                        </div>
                      )}
                    </div>
                    {item.notes && (
                      <div className="mt-3 text-sm">
                        <div className="text-muted-foreground">Notes</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Updated {formatDate(item.lastUpdated, 'MMM d, yyyy')}
                    </div>
                    <div className="space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Inventory Item Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Update the inventory item details' : 'Add a new item to your inventory'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Tomato Seeds, Organic Fertilizer"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={(e) => handleSelectChange('category', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      name="quantity"
                      value={formData.quantity || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={(e) => handleSelectChange('unit', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {units.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">Price/Unit ($) *</Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      name="pricePerUnit"
                      value={formData.pricePerUnit || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumStock">Minimum Stock Level</Label>
                    <Input
                      id="minimumStock"
                      type="number"
                      name="minimumStock"
                      value={formData.minimumStock || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Leave 0 to disable"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier (Optional)</Label>
                    <Input
                      id="supplier"
                      name="supplier"
                      value={formData.supplier || ''}
                      onChange={handleInputChange}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional notes about this item..."
                  />
                </div>
                
                {formData.quantity > 0 && formData.pricePerUnit > 0 && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm font-medium">
                      Total Value: ${(formData.quantity * formData.pricePerUnit).toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Item' : 'Add Item'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
