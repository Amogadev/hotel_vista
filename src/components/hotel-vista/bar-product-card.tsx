
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/context/data-provider';
import { BarQuickActionsDropdown } from './bar-quick-actions-dropdown';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

type BarProductCardProps = {
    item: InventoryItem;
    onView: (item: InventoryItem) => void;
    onAction: (action: 'edit' | 'stock' | 'delete', item: InventoryItem) => void;
};

const statusColorMap: { [key: string]: string } = {
  good: 'bg-green-100 text-gray-700 border-green-200',
  low: 'bg-yellow-100 text-gray-700 border-yellow-200',
  critical: 'bg-red-100 text-gray-700 border-red-200',
};

export function BarProductCard({ item, onView, onAction }: BarProductCardProps) {
  
  const handleUpdateStockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onAction('stock', item);
  };
  
  const colorClass = statusColorMap[item.status] || '';

  return (
    <Card className="relative flex flex-col transition-all duration-200 hover:shadow-lg w-40 h-40 rounded-lg">
        <div className="absolute top-1 right-1 z-10">
          <BarQuickActionsDropdown item={item} onAction={onAction} />
        </div>
      <CardContent 
        className={cn(
            "flex-grow flex flex-col items-center justify-center p-2 text-center cursor-pointer rounded-lg",
            colorClass
        )}
        onClick={() => onView(item)}
      >
        <p className="text-xl font-bold truncate">{item.name}</p>
        <Badge variant={'default'} className={cn("mt-2 capitalize", colorClass, !colorClass.includes('text-') && 'text-foreground')}>
            {item.stock} in stock
        </Badge>
        
        <div className="mt-3 text-sm text-center space-y-1">
            <p className="font-semibold truncate flex items-center justify-center gap-1">
                <DollarSign className="h-3 w-3" />
                {item.price}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
