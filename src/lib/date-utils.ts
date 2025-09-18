import { format as formatDateFns } from 'date-fns';

/**
 * Formats a date to a readable string
 * @param date - The date to format (Date object or string)
 * @param format - The format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, format: string = 'MMM d, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return formatDateFns(dateObj, format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}
