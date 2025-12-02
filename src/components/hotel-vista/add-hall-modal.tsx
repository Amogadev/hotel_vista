
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
import { addHall } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInCalendarDays } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Hall } from '@/context/data-provider';


const facilitiesList = ['Projector', 'Sound System', 'AC', 'Whiteboard', 'TV'];

const hallSchema = z.object({
  name: z.string().min(1, 'Hall name is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  facilities: z.array(z.string()).min(1, 'At least one facility is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  status: z.enum(['Available', 'Booked', 'Maintenance']),
  customerName: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  totalPrice: z.coerce.number().optional(),
});

export type HallFormValues = z.infer<typeof hallSchema>;

type AddHallModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onHallAdded: (newHall: Hall) => void;
};

export function AddHallModal({ isOpen, onClose, onHallAdded }: AddHallModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallSchema),
    defaultValues: {
      name: '',
      capacity: 50,
      facilities: [],
      price: 5000,
      status: 'Available',
      customerName: '',
      totalPrice: 0,
    },
  });

  const { watch, setValue } = form;
  const customerName = watch('customerName');
  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const price = watch('price');
  const status = watch('status');
  const totalPrice = watch('totalPrice');

  useEffect(() => {
    const hasBookingDetails = customerName || checkIn || checkOut;
    if (hasBookingDetails && status !== 'Booked') {
      setValue('status', 'Booked');
    } else if (!hasBookingDetails && status === 'Booked') {
      setValue('status', 'Available');
    }
  }, [customerName, checkIn, checkOut, status, setValue]);

  useEffect(() => {
    if (checkIn && checkOut && price > 0) {
      const days = differenceInCalendarDays(checkOut, checkIn);
       if (days >= 0) {
        const hours = (days + 1) * 24; // Assuming full day bookings
        setValue('totalPrice', price * hours);
      } else {
        setValue('totalPrice', 0);
      }
    } else {
      setValue('totalPrice', 0);
    }
  }, [checkIn, checkOut, price, setValue]);

  const onSubmit = (values: HallFormValues) => {
    startTransition(async () => {
      try {
        const result = await addHall({
          ...values,
          checkIn: values.checkIn ? values.checkIn.toISOString() : undefined,
          checkOut: values.checkOut ? values.checkOut.toISOString() : undefined,
        });

        if (result.success && result.hall) {
          toast({
            title: 'Hall Added',
            description: `Hall ${values.name} has been successfully added.`,
          });
          onHallAdded(result.hall as Hall);
          onClose();
          form.reset();
        } else {
          throw new Error(result.error || 'Failed to add hall');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to add the hall. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Hall</DialogTitle>
          <DialogDescription>
            Enter the details for the new hall. Fill booking info to auto-set status to Booked.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <Form {...form}>
            <form id="add-hall-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hall Name</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a hall name" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Grand Ballroom">Grand Ballroom</SelectItem>
                          <SelectItem value="Conference Room">Conference Room</SelectItem>
                          <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <Input type="number" placeholder="e.g., 200" {...field} />
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
                              <Input type="number" placeholder="e.g., 10000" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
              
              <FormField
                control={form.control}
                name="facilities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Facilities</FormLabel>
                      <FormDescription>
                        Select the facilities available in this hall.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                    {facilitiesList.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="facilities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 rounded-md border p-4">
                   <h4 className="font-medium text-sm">Booking Information</h4>
                  <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Customer Name</FormLabel>
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
                          <FormLabel>From</FormLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                  variant={'outline'}
                                  className={cn( 'w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground' )}>
                                  {field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}
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
                                  {field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}
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
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-hall-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Hall
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
