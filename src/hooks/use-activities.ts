import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { Activity } from '@/types';

export function useActivities() {
  const { 
    isInitialized, 
    addActivity, 
    getActivities, 
    updateActivity, 
    deleteActivity 
  } = useDatabase();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load activities from the database
  const loadActivities = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setIsLoading(true);
      const data = await getActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError(err instanceof Error ? err : new Error('Failed to load activities'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, getActivities]);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Add a new activity
  const addNewActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const now = new Date().toISOString();
      const newActivity = {
        ...activityData,
        createdAt: now,
        updatedAt: now,
      };
      
      const id = await addActivity(newActivity);
      await loadActivities(); // Refresh the list
      return id;
    } catch (err) {
      console.error('Failed to add activity:', err);
      throw err;
    }
  };

  // Update an existing activity
  const updateExistingActivity = useCallback(async (id: IDBValidKey, updates: Partial<Omit<Activity, 'id' | 'createdAt'>>) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      await updateActivity(id, updates);
      await loadActivities(); // Refresh the list
    } catch (err) {
      console.error('Failed to update activity:', err);
      throw err;
    }
  }, [isInitialized, updateActivity, loadActivities]);

  // Delete an activity
  const removeActivity = useCallback(async (id: IDBValidKey) => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      await deleteActivity(id);
      await loadActivities(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete activity:', err);
      throw err;
    }
  }, [isInitialized, deleteActivity, loadActivities]);

  // Get activities filtered by date range
  const getActivitiesByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isInitialized) return [];
    
    try {
      const allActivities = await getActivities();
      return allActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startDate && activityDate <= endDate;
      });
    } catch (err) {
      console.error('Failed to filter activities by date:', err);
      return [];
    }
  }, [isInitialized, getActivities]);

  // Get activities by type
  const getActivitiesByType = useCallback(async (type: string) => {
    if (!isInitialized) return [];
    
    try {
      const allActivities = await getActivities();
      return allActivities.filter(activity => activity.activityType === type);
    } catch (err) {
      console.error(`Failed to get activities of type ${type}:`, err);
      return [];
    }
  }, [isInitialized, getActivities]);

  // Get activities by crop
  const getActivitiesByCrop = useCallback(async (crop: string) => {
    if (!isInitialized) return [];
    
    try {
      const allActivities = await getActivities();
      return allActivities.filter(activity => activity.crop === crop);
    } catch (err) {
      console.error(`Failed to get activities for crop ${crop}:`, err);
      return [];
    }
  }, [isInitialized, getActivities]);

  return {
    activities,
    isLoading,
    error,
    addActivity: addNewActivity,
    updateActivity: updateExistingActivity,
    deleteActivity: removeActivity,
    getActivitiesByDateRange,
    getActivitiesByType,
    getActivitiesByCrop,
    refresh: loadActivities,
  };
}
