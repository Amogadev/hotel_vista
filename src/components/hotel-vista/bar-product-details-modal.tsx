
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Box, Type, BarChart } from 'lucide-react';
import type { InventoryItem } from '@/context/data-provider';

type BarProductDetailsModalProps = {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
};

const statusColorMap: { [key: string]: string } = {
  good: 'bg-green-100 text-green-800 border-green-200',
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

export function BarProductDetailsModal({ item, isOpen, onClose }: BarProductDetailsModalProps) {
    const colorClass = statusColorMap[item.status] || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product: {item.name}</DialogTitle>
          <DialogDescription>
            Viewing details for this product.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Status</span>
                <Badge className={`capitalize ${colorClass}`}>{item.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{item.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">₹{item.price}</p>
                    </div>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="font-medium">{item.stock} units</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

