'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, User, Clock, Calendar, DollarSign, Search, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/date-utils';
import { storage } from '@/lib/utils/storage';

type LabourRecord = {
  id: string;
  date: string;
  workerName: string;
  task: string;
  hoursWorked: number;
  hourlyRate: number;
  totalPay: number;
  notes?: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  paymentMethod?: string;
  createdAt: string;
};

export default function LabourPage() {
  const [labourRecords, setLabourRecords] = useState<LabourRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<LabourRecord, 'id' | 'createdAt' | 'totalPay'>>({ 
    date: new Date().toISOString().split('T')[0],
    workerName: '',
    task: '',
    hoursWorked: 0,
    hourlyRate: 0,
    notes: '',
    status: 'pending',
    paymentMethod: ''
  });

  // Common tasks
  const commonTasks = [
    'Planting',
    'Harvesting',
    'Weeding',
    'Irrigation',
    'Pruning',
    'Fertilizing',
    'Pest Control',
    'General Maintenance',
    'Equipment Operation',
    'Packing',
    'Other'
  ];

  // Payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' },
  ];

  // Load labour records from localStorage
  useEffect(() => {
    const storedRecords = storage.get<LabourRecord[]>('labour', []);
    setLabourRecords(storedRecords);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: name === 'hoursWorked' || name === 'hourlyRate' 
          ? parseFloat(value) || 0 
          : value
      };
      
      // Recalculate total pay when hours or rate changes
      if ((name === 'hoursWorked' || name === 'hourlyRate') && !isNaN(updated.hoursWorked) && !isNaN(updated.hourlyRate)) {
        updated.totalPay = updated.hoursWorked * updated.hourlyRate;
      }
      
      return updated;
    });
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
    const totalPay = formData.hoursWorked * formData.hourlyRate;
    
    if (editingId) {
      // Update existing record
      const updatedRecords = labourRecords.map(record => 
        record.id === editingId 
          ? { 
              ...formData, 
              id: editingId, 
              totalPay,
              updatedAt: now 
            }
          : record
      );
      setLabourRecords(updatedRecords);
      storage.set('labour', updatedRecords);
      setEditingId(null);
    } else {
      // Add new record
      const newRecord: LabourRecord = {
        id: Date.now().toString(),
        ...formData,
        totalPay,
        createdAt: now,
        paymentDate: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : undefined
      };
      
      const updatedRecords = [...labourRecords, newRecord];
      setLabourRecords(updatedRecords);
      storage.set('labour', updatedRecords);
    }
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      workerName: '',
      task: '',
      hoursWorked: 0,
      hourlyRate: 0,
      notes: '',
      status: 'pending',
      paymentMethod: ''
    });
    
    setIsFormOpen(false);
  };

  const handleEdit = (record: LabourRecord) => {
    setFormData({
      date: record.date,
      workerName: record.workerName,
      task: record.task,
      hoursWorked: record.hoursWorked,
      hourlyRate: record.hourlyRate,
      notes: record.notes || '',
      status: record.status,
      paymentMethod: record.paymentMethod || '',
      paymentDate: record.paymentDate
    });
    setEditingId(record.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedRecords = labourRecords.filter(record => record.id !== id);
    setLabourRecords(updatedRecords);
    storage.set('labour', updatedRecords);
  };

  const handleStatusChange = (id: string, status: 'pending' | 'paid') => {
    const updatedRecords = labourRecords.map(record => 
      record.id === id 
        ? { 
            ...record, 
            status,
            paymentDate: status === 'paid' && !record.paymentDate 
              ? new Date().toISOString().split('T')[0] 
              : record.paymentDate
          } 
        : record
    );
    setLabourRecords(updatedRecords);
    storage.set('labour', updatedRecords);
  };

  const filteredRecords = labourRecords.filter(record => 
    record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate totals
  const totalHours = labourRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
  const totalPayroll = labourRecords.reduce((sum, record) => sum + record.totalPay, 0);
  const pendingPayments = labourRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.totalPay, 0);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Labour Management</h1>
          <p className="text-muted-foreground">Track worker hours and payments</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(labourRecords.map(r => r.workerName)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique workers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">All-time total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayroll.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments > 0 ? `$${pendingPayments.toFixed(2)} pending` : 'All payments processed'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search labour records..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No labour records found. Add your first record to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(record => (
                <Card key={record.id} className="overflow-hidden">
                  <div className={`h-1 ${record.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{record.workerName}</CardTitle>
                        <CardDescription className="mt-1">
                          {record.task} • {record.hoursWorked} hours @ ${record.hourlyRate}/hr
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          ${record.totalPay.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(record.date)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                            <div className="text-muted-foreground">Status</div>
                            <div className="font-medium capitalize">
                              {record.status}
                              {record.paymentDate && record.status === 'paid' && (
                                <span className="text-xs text-muted-foreground block">
                                  Paid on {formatDate(record.paymentDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          {record.paymentMethod && (
                            <div>
                              <div className="text-muted-foreground">Payment Method</div>
                              <div className="capitalize">
                                {paymentMethods.find(p => p.value === record.paymentMethod)?.label || record.paymentMethod}
                              </div>
                            </div>
                          )}
                          {record.notes && (
                            <div className="col-span-2 mt-2">
                              <div className="text-muted-foreground">Notes</div>
                              <p className="text-sm">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div>
                          <Button
                            variant={record.status === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange(record.id, 'pending')}
                            className="mr-2"
                          >
                            Mark Pending
                          </Button>
                          <Button
                            variant={record.status === 'paid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange(record.id, 'paid')}
                          >
                            Mark Paid
                          </Button>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
      
            {/* Add/Edit Labour Record Form Modal */}
            {isFormOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>
                      {editingId ? 'Edit Labour Record' : 'Add New Labour Record'}
                    </CardTitle>
                    <CardDescription>
                      {editingId ? 'Update the worker details' : 'Record a new work session'}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date *</Label>
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
                          <Label htmlFor="workerName">Worker Name *</Label>
                          <Input
                            id="workerName"
                            name="workerName"
                            value={formData.workerName}
                            onChange={handleInputChange}
                            placeholder="Worker's full name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="task">Task *</Label>
                          <select
                            id="task"
                            name="task"
                            value={formData.task}
                            onChange={(e) => handleSelectChange('task', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          >
                            <option value="">Select a task</option>
                            {commonTasks.map(task => (
                              <option key={task} value={task}>{task}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hoursWorked">Hours *</Label>
                            <Input
                              id="hoursWorked"
                              type="number"
                              name="hoursWorked"
                              value={formData.hoursWorked || ''}
                              onChange={handleInputChange}
                              min="0"
                              step="0.25"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Rate/hr ($) *</Label>
                            <Input
                              id="hourlyRate"
                              type="number"
                              name="hourlyRate"
                              value={formData.hourlyRate || ''}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={(e) => handleSelectChange('status', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        </div>
                        
                        {formData.status === 'paid' && (
                          <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method *</Label>
                            <select
                              id="paymentMethod"
                              name="paymentMethod"
                              value={formData.paymentMethod || ''}
                              onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              required={formData.status === 'paid'}
                            >
                              <option value="">Select method</option>
                              {paymentMethods.map(method => (
                                <option key={method.value} value={method.value}>
                                  {method.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes || ''}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Any additional notes about this work session..."
                        />
                      </div>
                      
                      {(formData.hoursWorked > 0 && formData.hourlyRate > 0) && (
                        <div className="p-3 bg-muted/50 rounded-md">
                          <div className="text-sm font-medium">
                            Total Pay: ${(formData.hoursWorked * formData.hourlyRate).toFixed(2)}
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
                        {editingId ? 'Update Record' : 'Add Record'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </div>
        );
      }
