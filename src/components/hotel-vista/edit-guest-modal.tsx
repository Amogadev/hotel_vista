
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
import { updateGuest } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { Guest } from '@/context/data-provider';

const guestSchema = z.object({
  name: z.string().min(1, 'Guest name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  idProof: z.string().min(1, 'ID proof is required'),
  bookingHistory: z.array(z.string()),
});

export type GuestFormValues = z.infer<typeof guestSchema>;

type EditGuestModalProps = {
  guest: Guest;
  isOpen: boolean;
  onClose: () => void;
  onGuestUpdated: (updatedGuest: GuestFormValues & { id: string }) => void;
};

export function EditGuestModal({ guest, isOpen, onClose, onGuestUpdated }: EditGuestModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
  });

  useEffect(() => {
    if (guest) {
      form.reset(guest);
    }
  }, [guest, form]);

  const onSubmit = (values: GuestFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateGuest({
            id: guest.id,
            ...values,
        });
        if (result.success) {
          toast({
            title: 'Guest Updated',
            description: `${values.name} has been successfully updated.`,
          });
          onGuestUpdated({ ...values, id: guest.id });
          onClose();
        } else {
          throw new Error('Failed to update guest');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to update guest. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Guest: {guest.name}</DialogTitle>
          <DialogDescription>
            Update the details for this guest.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="e.g., john.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., +1-202-555-0104" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 123 Main St, Anytown USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="idProof"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Proof</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Passport A1234567" {...field} />
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
