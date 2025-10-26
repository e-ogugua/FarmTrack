'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/date-utils';
import { storage } from '@/lib/utils/storage';

type Sale = {
  id: string;
  date: string;
  product: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  customer: string;
  notes: string;
  createdAt: string;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Sale, 'id' | 'createdAt' | 'total'>>({ 
    date: new Date().toISOString().split('T')[0],
    product: '',
    quantity: 0,
    pricePerUnit: 0,
    customer: '',
    notes: ''
  });

  // Load sales from localStorage
  useEffect(() => {
    const storedSales = storage.get<Sale[]>('sales', []);
    setSales(storedSales);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'pricePerUnit' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSale: Sale = {
      id: Date.now().toString(),
      ...formData,
      total: formData.quantity * formData.pricePerUnit,
      createdAt: new Date().toISOString()
    };

    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    storage.set('sales', updatedSales);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      product: '',
      quantity: 0,
      pricePerUnit: 0,
      customer: '',
      notes: ''
    });
    
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    const updatedSales = sales.filter(sale => sale.id !== id);
    setSales(updatedSales);
    storage.set('sales', updatedSales);
  };

  const filteredSales = sales.filter(sale => 
    sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" data-testid="sales-title">Sales</h1>
          <p className="text-muted-foreground">Manage your farm&apos;s sales records</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sales..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No sales records found. Add your first sale to get started.
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{sale.product}</CardTitle>
                    <CardDescription className="mt-1">
                      {sale.quantity} units at ${sale.pricePerUnit.toFixed(2)} each
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${sale.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(sale.date)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div>Customer: {sale.customer}</div>
                  {sale.notes && <div className="mt-1">Notes: {sale.notes}</div>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleDelete(sale.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Sale Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Record New Sale</CardTitle>
              <CardDescription>Add details of the sale transaction</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Input
                      id="product"
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                      placeholder="e.g., Tomatoes, Eggs"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
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
                    <Label htmlFor="pricePerUnit">Price per Unit ($)</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="Customer name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional notes about this sale..."
                  />
                </div>
                
                {formData.quantity > 0 && formData.pricePerUnit > 0 && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm font-medium">Total: ${(formData.quantity * formData.pricePerUnit).toFixed(2)}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  Save Sale
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
