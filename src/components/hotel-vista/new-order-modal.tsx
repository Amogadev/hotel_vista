
'use client';

import { useState, useTransition } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addOrder } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const orderSchema = z.object({
  table: z.coerce.number().min(1, 'Table number is required'),
  items: z.string().min(1, 'Items are required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

type NewOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOrderAdded: (newOrder: OrderFormValues) => void;
};

export function NewOrderModal({ isOpen, onClose, onOrderAdded }: NewOrderModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      table: 1,
      items: '',
      price: 10,
    },
  });

  const onSubmit = (values: OrderFormValues) => {
    startTransition(async () => {
      try {
        const result = await addOrder(values);
        if (result.success) {
          toast({
            title: 'Order Added',
            description: `A new order has been successfully added.`,
          });
          onOrderAdded(values);
          form.reset();
        } else {
          throw new Error('Failed to add order');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to add the order. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Enter the details for the new order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="table"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Table Number</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Total Price</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 42.50" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 1x Grilled Salmon, 2x Caesar Salad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
