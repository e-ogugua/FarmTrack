'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calculator, DollarSign, FileText, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useDatabase } from '@/contexts/DatabaseContext';

type TaxRecord = {
  id: string;
  year: number;
  type: 'income' | 'expense' | 'deduction';
  category: string;
  amount: number;
  description: string;
  date: string;
};

type TaxSummary = {
  totalIncome: number;
  totalExpenses: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTax: number;
};

export default function TaxManagerPage() {
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [summary, setSummary] = useState<TaxSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    estimatedTax: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TaxRecord | null>(null);
  const [formData, setFormData] = useState<Omit<TaxRecord, 'id'>>({
    year: new Date().getFullYear(),
    type: 'income',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const { add, getAll, remove, update } = useDatabase();

  const loadTaxRecords = useCallback(async () => {
    try {
      const stored = await getAll<TaxRecord>('tax-records');
      setRecords(stored);
    } catch (err) {
      console.error('Error loading tax records:', err);
    }
  }, [getAll]);

  const calculateSummary = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const yearRecords = records.filter((r: TaxRecord) => r.year === currentYear);

    const totalIncome = yearRecords
      .filter((r: TaxRecord) => r.type === 'income')
      .reduce((sum: number, r: TaxRecord) => sum + r.amount, 0);
    const totalExpenses = yearRecords
      .filter((r: TaxRecord) => r.type === 'expense')
      .reduce((sum: number, r: TaxRecord) => sum + r.amount, 0);
    const totalDeductions = yearRecords
      .filter((r: TaxRecord) => r.type === 'deduction')
      .reduce((sum: number, r: TaxRecord) => sum + r.amount, 0);

    const taxableIncome = Math.max(0, totalIncome - totalExpenses - totalDeductions);
    const estimatedTax = taxableIncome * 0.15;

    setSummary({
      totalIncome,
      totalExpenses,
      totalDeductions,
      taxableIncome,
      estimatedTax,
    });
  }, [records]);

  useEffect(() => {
    loadTaxRecords();
  }, [loadTaxRecords]);

  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await update('tax-records', { ...formData, id: editingRecord.id });
      } else {
        await add('tax-records', formData);
      }
      await loadTaxRecords();
      resetForm();
    } catch (err) {
      console.error('Error saving tax record:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      type: 'income',
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingRecord(null);
    setIsFormOpen(false);
  };

  const editRecord = (record: TaxRecord) => {
    setFormData(record);
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const deleteRecord = async (id: string) => {
    try {
      await remove('tax-records', id);
      await loadTaxRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tax Manager</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Tax Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summary.totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${summary.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${summary.taxableIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${summary.estimatedTax.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRecord ? 'Edit Tax Record' : 'Add Tax Record'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense' | 'deduction') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="deduction">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Sales, Equipment, Supplies"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingRecord ? 'Update' : 'Add'} Record</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tax Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Records ({new Date().getFullYear()})</CardTitle>
        </CardHeader>
        <CardContent>
          {records.filter((r: TaxRecord) => r.year === new Date().getFullYear()).length === 0 ? (
            <p className="text-gray-500">No tax records for this year.</p>
          ) : (
            <div className="space-y-2">
              {records
                .filter((r: TaxRecord) => r.year === new Date().getFullYear())
                .map((record: TaxRecord) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={record.type === 'income' ? 'default' : record.type === 'expense' ? 'destructive' : 'secondary'}>
                          {record.type}
                        </Badge>
                        <span className="font-medium">{record.category}</span>
                      </div>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${record.amount.toLocaleString()}</p>
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" variant="outline" onClick={() => editRecord(record)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteRecord(record.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
