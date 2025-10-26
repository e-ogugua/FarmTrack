import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatDate } from '@/lib/date-utils';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  supplier?: string;
  lastUpdated: string;
  minimumStock: number;
  notes?: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  category: string;
  unit: string;
  isLowStock: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export default React.memo(function InventoryItemCard({
  item,
  category,
  unit,
  isLowStock,
  onEdit,
  onDelete,
}: InventoryItemCardProps) {
  // Enhanced keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Enhanced stock status for accessibility
  const stockStatus = isLowStock
    ? 'Low stock - requires attention'
    : 'Stock level normal';

  const totalValue = item.quantity * item.pricePerUnit;

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-red-200 dark:border-red-900 ring-1 ring-red-100 dark:ring-red-900/50' : ''}`}
      role="article"
      aria-labelledby={`item-title-${item.id}`}
      aria-describedby={`item-description-${item.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle
              id={`item-title-${item.id}`}
              className="text-responsive-lg font-semibold leading-tight"
            >
              {item.name}
            </CardTitle>
            <CardDescription
              id={`item-description-${item.id}`}
              className="mt-1 text-responsive-sm"
            >
              {category} • {unit}
              {isLowStock && (
                <span className="sr-only"> - {stockStatus}</span>
              )}
            </CardDescription>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <div
              className="text-responsive-lg font-semibold"
              aria-label={`Current quantity: ${item.quantity} ${item.unit}`}
            >
              {item.quantity} {item.unit}
            </div>
            {isLowStock && (
              <div
                className="text-responsive-xs text-red-500 font-medium"
                role="status"
                aria-live="polite"
                aria-label="Low stock alert"
              >
                Low Stock
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Enhanced price and value information */}
        <div className="grid grid-cols-2 gap-3 text-responsive-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Price/Unit</div>
            <div
              className="font-medium"
              aria-label={`Price per unit: $${item.pricePerUnit.toFixed(2)}`}
            >
              ${item.pricePerUnit.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Total Value</div>
            <div
              className="font-medium text-primary"
              aria-label={`Total inventory value: $${totalValue.toFixed(2)}`}
            >
              ${totalValue.toFixed(2)}
            </div>
          </div>

          {item.minimumStock > 0 && (
            <div className="space-y-1">
              <div className="text-muted-foreground font-medium">Min. Stock</div>
              <div
                className={`font-medium ${isLowStock ? 'text-red-600' : 'text-foreground'}`}
                aria-label={`Minimum stock level: ${item.minimumStock} ${item.unit}`}
              >
                {item.minimumStock} {item.unit}
              </div>
            </div>
          )}

          {item.supplier && (
            <div className="space-y-1">
              <div className="text-muted-foreground font-medium">Supplier</div>
              <div
                className="truncate font-medium"
                title={item.supplier}
                aria-label={`Supplier: ${item.supplier}`}
              >
                {item.supplier}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced notes section */}
        {item.notes && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-muted-foreground font-medium text-responsive-xs mb-1">
              Notes
            </div>
            <p
              className="text-responsive-xs text-muted-foreground line-clamp-2"
              title={item.notes}
              aria-label={`Notes: ${item.notes}`}
            >
              {item.notes}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t border-border/50">
        <div className="text-responsive-xs text-muted-foreground">
          <span className="sr-only">Last updated: </span>
          {formatDate(item.lastUpdated, 'MMM d, yyyy')}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="touch-target hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
            onClick={() => onEdit(item)}
            onKeyDown={(e) => handleKeyDown(e, () => onEdit(item))}
            aria-label={`Edit ${item.name} inventory item`}
            title={`Edit ${item.name}`}
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="touch-target text-destructive hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
            onClick={() => onDelete(item.id)}
            onKeyDown={(e) => handleKeyDown(e, () => onDelete(item.id))}
            aria-label={`Delete ${item.name} inventory item`}
            title={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});
