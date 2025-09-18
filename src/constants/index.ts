// Activity types
export const ACTIVITY_TYPES = [
  { value: 'planting', label: 'Planting' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'fertilization', label: 'Fertilization' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'other', label: 'Other' },
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'labor', label: 'Labor' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' },
];

// Units of measurement
export const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'bag', label: 'Bag' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
];

// Crop types
export const CROP_TYPES = [
  'Maize', 'Wheat', 'Rice', 'Soybeans', 'Potatoes',
  'Tomatoes', 'Onions', 'Carrots', 'Lettuce', 'Cabbage',
  'Spinach', 'Peppers', 'Eggplant', 'Okra', 'Cucumber',
  'Watermelon', 'Melon', 'Pumpkin', 'Squash', 'Beans',
  'Peas', 'Lentils', 'Chickpeas', 'Sunflower', 'Canola',
  'Cotton', 'Tobacco', 'Coffee', 'Tea', 'Cocoa',
  'Sugarcane', 'Cassava', 'Yam', 'Sweet Potatoes', 'Plantains',
  'Bananas', 'Pineapple', 'Mango', 'Avocado', 'Citrus'
].sort();

// Inventory categories
export const INVENTORY_CATEGORIES = [
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'tools', label: 'Tools' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
];

// Default form values
export const DEFAULT_ACTIVITY_FORM = {
  date: new Date().toISOString().split('T')[0],
  activityType: '',
  crop: '',
  notes: ''
};

export const DEFAULT_EXPENSE_FORM = {
  date: new Date().toISOString().split('T')[0],
  item: '',
  category: '',
  amount: 0,
  notes: ''
};

export const DEFAULT_SALE_FORM = {
  date: new Date().toISOString().split('T')[0],
  product: '',
  quantity: 1,
  pricePerUnit: 0,
  notes: ''
};

export const DEFAULT_INVENTORY_ITEM = {
  name: '',
  category: '',
  quantity: 0,
  unit: 'kg',
  pricePerUnit: 0,
  supplier: '',
  notes: ''
};
