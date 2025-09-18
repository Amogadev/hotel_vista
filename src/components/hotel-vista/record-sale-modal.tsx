
'use client';

import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wine, Bed } from 'lucide-react';
import { Separator } from '../ui/separator';

type SaleItem = {
    name: string;
    price: number;
    quantity: number;
};

type RecordSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaleRecorded: () => void;
  saleItems: SaleItem[];
  total: number;
  room?: string;
};

export function RecordSaleModal({ isOpen, onClose, onSaleRecorded, saleItems, total, room }: RecordSaleModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
        await onSaleRecorded();
        onClose();
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Sale</DialogTitle>
          <DialogDescription>
            Review the sale details before recording. This will update stock levels.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                {saleItems.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <p>{item.quantity}x {item.name}</p>
                        <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
            </div>
            {room && (
                <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                    <p className="flex items-center gap-2"><Bed className="h-4 w-4" /> Charge to Room</p>
                    <p className="font-medium">{room}</p>
                </div>
            )}
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm &amp; Record Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
