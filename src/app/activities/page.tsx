'use client';

import { useState, useEffect } from 'react';
import { Plus, Activity, Calendar, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/date-utils';
import { storage } from '@/lib/utils/storage';

type Activity = {
  id: string;
  date: string;
  activityType: string;
  crop: string;
  notes: string;
  createdAt: string;
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<Omit<Activity, 'id' | 'createdAt'>>({ 
    date: new Date().toISOString().split('T')[0],
    activityType: '',
    crop: '',
    notes: ''
  });

  // Load activities from localStorage
  useEffect(() => {
    const storedActivities = storage.get<Activity[]>('activities', []);
    setActivities(storedActivities);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    storage.set('activities', updatedActivities);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      activityType: '',
      crop: '',
      notes: ''
    });

    setIsFormOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="activities-title">Activity Management</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage agricultural activities. Click &quot;Add Activity&quot; to create new record.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Activity
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Activity</CardTitle>
            <CardDescription>Record agricultural activity data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityType">Activity Type</Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(value) => setFormData({...formData, activityType: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planting">Planting</SelectItem>
                      <SelectItem value="irrigation">Irrigation</SelectItem>
                      <SelectItem value="fertilization">Fertilization</SelectItem>
                      <SelectItem value="pest_control">Pest Control</SelectItem>
                      <SelectItem value="harvesting">Harvesting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crop">Crop</Label>
                  <Input
                    id="crop"
                    name="crop"
                    placeholder="e.g., Maize, Tomatoes"
                    value={formData.crop}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional details..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" /> Save Activity
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Activities</h2>

        {activities.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Activity className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>No activities recorded yet.</p>
              <p className="text-sm">Click the &quot;Add Activity&quot; button to create first record.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium capitalize">{activity.activityType.replace('_', ' ')}</h3>
                      <p className="text-sm text-muted-foreground">{activity.crop}</p>
                      {activity.notes && <p className="mt-1 text-sm">{activity.notes}</p>}
                    </div>
                    <div className="text-sm text-right">
                      <div className="font-medium">{formatDate(activity.date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
