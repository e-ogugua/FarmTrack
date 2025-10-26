'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for inventory content to enable code splitting
const InventoryContent = dynamic(() => import('@/components/inventory/InventoryContent'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground font-medium">Loading inventory...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for client-side inventory functionality
});

export default function InventoryPage() {
  return <InventoryContent />;
}
