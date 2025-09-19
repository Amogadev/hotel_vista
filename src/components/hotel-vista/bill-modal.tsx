

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
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type ActiveOrder = {
  id: string;
  status: string;
  table: number;
  items: string;
  time: Date;
  price: number;
};

type BillModalProps = {
  order: ActiveOrder;
  isOpen: boolean;
  onClose: () => void;
};

export function BillModal({ order, isOpen, onClose }: BillModalProps) {
  const { toast } = useToast();
  
  const items = order.items.split(', ').map(item => {
    const quantity = (item.match(/(\d+)x/) || [null, 1])[1];
    const name = item.replace(/(\d+)x /, '');
    const itemPrice = order.price / (order.items.split(', ').reduce((acc, i) => acc + (parseInt(i.split('x')[0]) || 1), 0));
    return {
      name,
      quantity,
      price: itemPrice
    };
  });
  
  const subtotal = items.reduce((acc, item) => acc + (item.price * Number(item.quantity)), 0);
  const total = order.price;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bill for Order {order.id}</DialogTitle>
          <DialogDescription>
            Table: {order.table} | {format(new Date(), 'PPpp')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.price * Number(item.quantity)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-2 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax/Charges</span>
              <span>₹{(total - subtotal).toFixed(2)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={() => {
            toast({
              title: 'Checkout Successful',
              description: `Bill for TABLE-${order.table} has been generated and paid.`,
            });
            onClose();
          }}>
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
