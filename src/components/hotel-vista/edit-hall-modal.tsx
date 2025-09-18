
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
  FormDescription,
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
import { updateHall } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import type { Hall } from '@/context/data-provider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { Textarea } from '../ui/textarea';

const facilitiesList = ['Projector', 'Sound System', 'AC', 'Whiteboard', 'TV'];

const hallSchema = z.object({
  name: z.string().min(1, 'Hall name is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  facilities: z.array(z.string()).min(1, 'At least one facility is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  status: z.enum(['Available', 'Booked', 'Maintenance']),
  customerName: z.string().optional(),
  contact: z.string().optional(),
  purpose: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  totalPrice: z.coerce.number().optional(),
});

type EditHallFormValues = z.infer<typeof hallSchema>;

type EditHallModalProps = {
  hall: Hall;
  isOpen: boolean;
  onClose: () => void;
  onHallUpdated: (updatedHall: Hall) => void;
};

export function EditHallModal({ hall, isOpen, onClose, onHallUpdated }: EditHallModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<EditHallFormValues>({
    resolver: zodResolver(hallSchema),
  });

  const { watch, setValue } = form;
  const customerName = watch('customerName');
  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const price = watch('price');
  const status = watch('status');

  useEffect(() => {
    if (hall) {
      form.reset({
        ...hall,
        checkIn: hall.checkIn ? parseISO(hall.checkIn) : undefined,
        checkOut: hall.checkOut ? parseISO(hall.checkOut) : undefined,
      });
    }
  }, [hall, form]);

  useEffect(() => {
    const hasCustomerDetails = customerName && checkIn && checkOut;
    if (hasCustomerDetails && status !== 'Booked') {
      setValue('status', 'Booked');
    } else if (!hasCustomerDetails && status === 'Booked') {
      setValue('status', 'Available');
    }
  }, [customerName, checkIn, checkOut, status, setValue]);

  useEffect(() => {
    if (checkIn && checkOut && price > 0) {
      const hours = differenceInCalendarDays(checkOut, checkIn) * 24; // Simplified, assuming full day bookings
      if (hours > 0) {
        setValue('totalPrice', price * hours);
      } else {
        setValue('totalPrice', price * 24);
      }
    } else {
      setValue('totalPrice', 0);
    }
  }, [checkIn, checkOut, price, setValue]);

  const onSubmit = (values: EditHallFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateHall({
            originalName: hall.name,
            ...values,
            checkIn: values.checkIn ? values.checkIn.toISOString() : undefined,
            checkOut: values.checkOut ? values.checkOut.toISOString() : undefined,
        });
        if (result.success && result.hall) {
          toast({
            title: 'Hall Updated',
            description: `Hall ${values.name} has been successfully updated.`,
          });
          onHallUpdated({ ...hall, ...values });
          onClose();
        } else {
          throw new Error(result.error || 'Failed to update hall');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to update the hall. Please try again.',
        });
      }
    });
  };
  
  const totalPrice = watch('totalPrice');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Hall: {hall.name}</DialogTitle>
          <DialogDescription>
            Update the hall details. Fill in customer info to automatically set status to "Booked".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hall Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!(customerName || checkIn || checkOut)}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
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
                        <FormLabel>Price/Hour (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-sm">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Smith" {...field} value={field.value ?? ''} />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 9876543210" {...field} value={field.value ?? ''} />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Purpose of Booking</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Wedding Reception" {...field} value={field.value ?? ''} />
                        </FormControl>
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="checkIn"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>From</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground' )}>
                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                            <FormLabel>To</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (checkIn || new Date('1900-01-01'))} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
            </div>

            {totalPrice > 0 && (
                <div className="col-span-2 text-lg font-semibold text-center bg-muted p-2 rounded-md">
                    Total Price: <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                </div>
            )}

            <DialogFooter className="col-span-1 md:col-span-2 pt-4">
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

    