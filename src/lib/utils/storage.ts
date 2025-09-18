// Simple wrapper around localStorage with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Initialize default data if it doesn't exist
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize activities if not exists
  if (!localStorage.getItem('activities')) {
    storage.set('activities', []);
  }
  
  // Initialize labour if not exists
  if (!localStorage.getItem('labour')) {
    storage.set('labour', []);
  }
  
  // Initialize expenses if not exists
  if (!localStorage.getItem('expenses')) {
    storage.set('expenses', []);
  }
  
  // Initialize sales if not exists
  if (!localStorage.getItem('sales')) {
    storage.set('sales', []);
  }
  
  // Initialize inventory if not exists
  if (!localStorage.getItem('inventory')) {
    storage.set('inventory', []);
  }
};

// Call initialize on module load
if (typeof window !== 'undefined') {
  initializeStorage();
}
