
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
import { updateRoom } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Room } from '@/context/data-provider';
import { Separator } from '../ui/separator';

const paymentSchema = z.object({
  newPayment: z.coerce.number().min(0, 'Payment cannot be negative'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

type ManagePaymentModalProps = {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated: (roomNumber: string, newPaidAmount: number) => void;
};

export function ManagePaymentModal({ room, isOpen, onClose, onPaymentUpdated }: ManagePaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        newPayment: 0,
    }
  });

  const currentPaidAmount = room.paidAmount || 0;
  const totalBill = room.totalPrice || 0;
  const balanceDue = totalBill - currentPaidAmount;

  const onSubmit = (values: PaymentFormValues) => {
    startTransition(async () => {
      try {
        const newPaidAmount = currentPaidAmount + values.newPayment;
        const result = await updateRoom({
            ...room,
            originalNumber: room.number,
            paidAmount: newPaidAmount,
        });

        if (result.success) {
          toast({
            title: 'Payment Updated',
            description: `₹${values.newPayment.toLocaleString()} has been added to the bill.`,
          });
          onPaymentUpdated(room.number, newPaidAmount);
          onClose();
        } else {
          throw new Error(result.error || 'Failed to update payment');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to update payment. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Payment for Room {room.number}</DialogTitle>
          <DialogDescription>
            Record new payments for {room.guest}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Bill</span>
                <span className="font-medium">₹{totalBill.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Currently Paid</span>
                <span className="font-medium text-green-600">₹{currentPaidAmount.toLocaleString()}</span>
            </div>
            <Separator/>
            <div className="flex justify-between font-bold">
                <span className="text-muted-foreground">Balance Due</span>
                <span className={balanceDue > 0 ? "text-red-600" : ""}>₹{balanceDue.toLocaleString()}</span>
            </div>
        </div>

        <Form {...form}>
          <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="newPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add New Payment</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
