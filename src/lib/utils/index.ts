import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

interface IndexableObject {
  [key: string]: string | number | boolean | null | undefined;
}

export function calculateTotal<T extends IndexableObject>(items: T[], field: keyof T): number {
  return items.reduce((sum, item) => {
    const value = item[field];
    const numValue = typeof value === 'number' ? value : Number(value);
    return sum + (isNaN(numValue) ? 0 : numValue);
  }, 0);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}
