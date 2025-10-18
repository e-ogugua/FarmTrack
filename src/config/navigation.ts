import { 
  Home, 
  Activity, 
  Users, 
  Package, 
  BarChart2,
  ShoppingBag,
  FileText,
  Cloud,
  Calculator
} from 'lucide-react';
import { ComponentType } from 'react';

/**
 * Navigation item interface defining the structure of each navigation link
 */
export interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  roles?: string[]; // For future role-based access control
  badge?: string; // For showing counts or status
}

/**
 * Array of navigation items used throughout the application
 */
export const NAV_ITEMS: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Overview of your farm operations',
    roles: ['admin', 'manager', 'worker']
  },
  { 
    name: 'Activities', 
    href: '/activities', 
    icon: Activity,
    description: 'Manage farm activities and tasks',
    roles: ['admin', 'manager', 'worker']
  },
  { 
    name: 'Labour', 
    href: '/labour', 
    icon: Users,
    description: 'Track labor and workforce management',
    roles: ['admin', 'manager']
  },
  { 
    name: 'Expenses', 
    href: '/expenses', 
    icon: FileText,
    description: 'Record and manage farm expenses',
    roles: ['admin', 'manager']
  },
  { 
    name: 'Sales', 
    href: '/sales', 
    icon: ShoppingBag,
    description: 'Track sales and revenue',
    roles: ['admin', 'manager', 'sales']
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: Package,
    description: 'Manage farm inventory and supplies',
    roles: ['admin', 'manager', 'inventory']
  },
  { 
    name: 'Weather', 
    href: '/weather', 
    icon: Cloud,
    description: 'Weather forecasts for farm planning',
    roles: ['admin', 'manager', 'worker']
  },
  { 
    name: 'Tax Manager', 
    href: '/tax-manager', 
    icon: Calculator,
    description: 'Tax calculations and records',
    roles: ['admin', 'manager']
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: BarChart2,
    description: 'View reports and analytics',
    roles: ['admin', 'manager']
  }
];
