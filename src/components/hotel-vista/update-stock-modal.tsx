
'use client';

import { useTransition, useEffect } from 'react';
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
import { updateBarProductStock } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const updateStockSchema = z.object({
  newStock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

export type UpdateStockFormValues = z.infer<typeof updateStockSchema>;

type InventoryItem = {
    name: string;
    stock: number;
};

type UpdateStockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated: (productName: string, newStock: number) => void;
  item: InventoryItem;
};

export function UpdateStockModal({ isOpen, onClose, onStockUpdated, item }: UpdateStockModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<UpdateStockFormValues>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      newStock: item.stock,
    },
  });

  useEffect(() => {
    form.reset({ newStock: item.stock });
  }, [item, form]);

  const onSubmit = (values: UpdateStockFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateBarProductStock(item.name, values.newStock);
        if (result.success) {
          toast({
            title: 'Stock Updated',
            description: `${item.name} stock has been updated to ${values.newStock}.`,
          });
          onStockUpdated(item.name, values.newStock);
          onClose();
        } else {
          throw new Error('Failed to update stock');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update stock. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock for {item.name}</DialogTitle>
          <DialogDescription>
            Current stock: {item.stock}. Enter the new stock quantity.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="newStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
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
                Update Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    