
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Package, Trash2 } from 'lucide-react';
import type { InventoryItem } from '@/context/data-provider';

type BarQuickActionsDropdownProps = {
  item: InventoryItem;
  onAction: (action: 'edit' | 'stock' | 'delete', item: InventoryItem) => void;
};

export function BarQuickActionsDropdown({ item, onAction }: BarQuickActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction('edit', item)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Product</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('stock', item)}>
          <Package className="mr-2 h-4 w-4" />
          <span>Update Stock</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction('delete', item)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Product</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
