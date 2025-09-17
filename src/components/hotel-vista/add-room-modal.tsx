
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
import { addRoom } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInCalendarDays } from 'date-fns';

const roomSchema = z.object({
  number: z.string().min(1, 'Room number is required'),
  type: z.string().min(1, 'Room type is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  status: z.string().min(1, 'Status is required'),
  guest: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  totalPrice: z.coerce.number().optional(),
});

export type RoomFormValues = z.infer<typeof roomSchema>;

type AddRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRoomAdded: (newRoom: RoomFormValues) => void;
};

export function AddRoomModal({ isOpen, onClose, onRoomAdded }: AddRoomModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      number: '',
      type: 'Standard Single',
      price: 100,
      status: 'Available',
      guest: '',
      totalPrice: 0,
    },
  });

  const { watch, setValue, trigger } = form;
  const guest = watch('guest');
  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const price = watch('price');
  const status = watch('status');

  useEffect(() => {
    const hasGuestDetails = guest && checkIn && checkOut;
    if (hasGuestDetails && status !== 'Occupied') {
      setValue('status', 'Occupied');
    } else if (!hasGuestDetails && status === 'Occupied') {
      setValue('status', 'Available');
    }
  }, [guest, checkIn, checkOut, status, setValue]);

  useEffect(() => {
    if (checkIn && checkOut && price > 0) {
      const nights = differenceInCalendarDays(checkOut, checkIn);
      if (nights > 0) {
        setValue('totalPrice', price * nights);
      } else {
        setValue('totalPrice', 0);
      }
    } else {
      setValue('totalPrice', 0);
    }
  }, [checkIn, checkOut, price, setValue]);

  const onSubmit = (values: RoomFormValues) => {
    startTransition(async () => {
      try {
        const result = await addRoom({
            ...values,
            checkIn: values.checkIn ? values.checkIn.toISOString() : undefined,
            checkOut: values.checkOut ? values.checkOut.toISOString() : undefined,
        });
        if (result.success) {
          toast({
            title: 'Room Added',
            description: `Room ${values.number} has been successfully added.`,
          });
          onRoomAdded(values);
          onClose();
          form.reset();
        } else {
          throw new Error(result.error || 'Failed to add room');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to add the room. Please try again.',
        });
      }
    });
  };

  const totalPrice = watch('totalPrice');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Enter the details for the new room. Fill in guest details to automatically set status to Occupied.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 101" {...field} />
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
                    <FormLabel>Price per Night</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 120" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Standard Single">Standard Single</SelectItem>
                      <SelectItem value="Standard Double">Standard Double</SelectItem>
                      <SelectItem value="Deluxe Single">Deluxe Single</SelectItem>
                      <SelectItem value="Deluxe Double">Deluxe Double</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="guest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name</FormLabel>
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
                name="checkIn"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Check-in Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP')
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Check-out Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP')
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < (checkIn || new Date('1900-01-01'))}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!(guest || checkIn || checkOut)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {totalPrice > 0 && (
                <div className="col-span-2 mt-2 text-lg font-semibold text-center bg-muted p-2 rounded-md">
                    Total Price: <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                </div>
            )}

            <DialogFooter className="col-span-1 md:col-span-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Room
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    