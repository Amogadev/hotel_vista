
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
import type { Room, Transaction } from '@/context/data-provider';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const paymentSchema = z.object({
  newPayment: z.coerce.number().min(0, 'Payment cannot be negative'),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

type ManagePaymentModalProps = {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated: (roomNumber: string, newPaidAmount: number, transactions: Transaction[]) => void;
};

export function ManagePaymentModal({ room, isOpen, onClose, onPaymentUpdated }: ManagePaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        newPayment: 0,
        paymentMethod: 'Cash',
    }
  });

  const currentPaidAmount = room.paidAmount || 0;
  const totalBill = room.totalPrice || 0;
  const balanceDue = totalBill - currentPaidAmount;
  const transactions = room.transactions || [];

  const onSubmit = (values: PaymentFormValues) => {
    startTransition(async () => {
      const newPaidAmount = currentPaidAmount + values.newPayment;
      const newTransaction: Transaction = {
        date: new Date().toISOString(),
        amount: values.newPayment,
        method: values.paymentMethod,
      };
      const updatedTransactions = [...transactions, newTransaction];

      const updatedRoomData = {
          ...room,
          originalNumber: room.number,
          paidAmount: newPaidAmount,
          transactions: updatedTransactions,
      };

      const result = await updateRoom(updatedRoomData);
      if (result.success) {
        toast({
          title: 'Payment Updated',
          description: `₹${values.newPayment.toLocaleString()} has been added to the bill.`,
        });
        onPaymentUpdated(room.number, newPaidAmount, updatedTransactions);
        onClose();
      } else {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error || 'Failed to update payment. Please try again.',
          });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Payment for Room {room.number}</DialogTitle>
          <DialogDescription>
            Record new payments and view transaction history for {room.guest}.
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

        <Separator />
        
        <div>
            <h4 className="font-medium text-sm mb-2">Transaction History</h4>
            <ScrollArea className="h-32 w-full rounded-md border">
                <div className="p-4">
                    {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                        <div key={index} className="flex justify-between items-center text-sm mb-2">
                            <div>
                                <p className="font-medium">₹{tx.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{tx.method}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{format(parseISO(tx.date), 'PP p')}</p>
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">No transactions yet.</p>
                    )}
                </div>
            </ScrollArea>
        </div>


        <Form {...form}>
          <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
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
                 <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="UPI">UPI / QR</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
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
