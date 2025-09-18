'use client';

import { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DatabaseProvider } from '../contexts/DatabaseContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <DatabaseProvider>
          {children}
        </DatabaseProvider>
      </TooltipProvider>
    </NextThemesProvider>
  );
}
