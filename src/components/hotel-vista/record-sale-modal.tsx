
'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { recordBarSale } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const saleSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  qty: z.coerce.number().min(1, 'Quantity must be at least 1'),
  room: z.string().optional(),
});

export type SaleFormValues = z.infer<typeof saleSchema>;

type InventoryItem = {
    name: string;
    price: number;
    stock: number;
};

type RecordSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaleRecorded: (sale: SaleFormValues) => void;
  inventoryItems: InventoryItem[];
};

export function RecordSaleModal({ isOpen, onClose, onSaleRecorded, inventoryItems }: RecordSaleModalProps) {
  const [isPending, startTransition] = useTransition();
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast();
  
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      name: '',
      qty: 1,
      room: '',
    },
  });

  const selectedItemName = form.watch('name');
  const quantity = form.watch('qty');

  useEffect(() => {
    const selectedItem = inventoryItems.find(item => item.name === selectedItemName);
    if (selectedItem) {
      setTotalPrice(selectedItem.price * quantity);
    } else {
      setTotalPrice(0);
    }
  }, [selectedItemName, quantity, inventoryItems]);

  const onSubmit = (values: SaleFormValues) => {
    const selectedItem = inventoryItems.find(item => item.name === values.name);
    if (!selectedItem) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Invalid item selected.',
        });
        return;
    }

    startTransition(async () => {
      try {
        const result = await recordBarSale({
            ...values,
            price: totalPrice,
        });
        if (result.success) {
          toast({
            title: 'Sale Recorded',
            description: `Sale of ${values.qty}x ${values.name} has been recorded.`,
          });
          onSaleRecorded(values);
          form.reset();
        } else {
          throw new Error('Failed to record sale');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to record the sale. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record a New Sale</DialogTitle>
          <DialogDescription>
            Enter the details for the new bar or liquor sale.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map(item => (
                        <SelectItem key={item.name} value={item.name}>
                          {item.name} (Stock: {item.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 204" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="pt-2 font-medium">
                Total Price: <span className="font-bold text-lg text-primary">₹{totalPrice.toFixed(2)}</span>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Sale
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
