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
    description: 'System overview and operational metrics',
    roles: ['admin', 'manager', 'worker']
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: Activity,
    description: 'Agricultural activity logging and tracking',
    roles: ['admin', 'manager', 'worker']
  },
  {
    name: 'Labour',
    href: '/labour',
    icon: Users,
    description: 'Workforce management and labor tracking',
    roles: ['admin', 'manager']
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: FileText,
    description: 'Expense recording and financial tracking',
    roles: ['admin', 'manager']
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingBag,
    description: 'Revenue tracking and sales management',
    roles: ['admin', 'manager', 'sales']
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    description: 'Inventory control and supply management',
    roles: ['admin', 'manager', 'inventory']
  },
  {
    name: 'Weather',
    href: '/weather',
    icon: Cloud,
    description: 'Weather data for operational planning',
    roles: ['admin', 'manager', 'worker']
  },
  {
    name: 'Tax Manager',
    href: '/tax-manager',
    icon: Calculator,
    description: 'Tax calculations and compliance records',
    roles: ['admin', 'manager']
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart2,
    description: 'Data analysis and reporting tools',
    roles: ['admin', 'manager']
  }
];
