
'use client';

import { useTransition, useEffect, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { updateHall } from '@/app/actions';
import { DataContext, Hall } from '@/context/data-provider';
import Topbar from '@/components/hotel-vista/topbar';
import { Textarea } from '@/components/ui/textarea';

const bookHallSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  contact: z.string().min(1, 'Contact number is required'),
  purpose: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  idProof: z.string().min(1, 'ID proof type is required'),
  checkIn: z.date({ required_error: 'Check-in date is required' }),
  checkOut: z.date({ required_error: 'Check-out date is required' }),
});

type BookHallFormValues = z.infer<typeof bookHallSchema>;

export default function BookHallPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { halls, setHalls } = useContext(DataContext);

  const hallName = decodeURIComponent(params.hallName as string);
  const hall = halls.find(h => h.name === hallName);

  const form = useForm<BookHallFormValues>({
    resolver: zodResolver(bookHallSchema),
    defaultValues: {
      checkIn: new Date(),
      customerName: '',
      contact: '',
      idProof: '',
      email: '',
      purpose: '',
    }
  });

  const { watch } = form;
  const checkIn = watch('checkIn');

  if (!hall) {
    return (
        <div className="flex flex-col min-h-screen">
            <Topbar />
            <main className="flex-1 pt-14 flex items-center justify-center">
                <p>Hall not found.</p>
            </main>
      </div>
    );
  }

  const onSubmit = (values: BookHallFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateHall({
          originalName: hall.name,
          name: hall.name,
          capacity: hall.capacity,
          facilities: hall.facilities,
          price: hall.price,
          status: 'Booked',
          customerName: values.customerName,
          contact: values.contact,
          purpose: values.purpose,
          email: values.email,
          idProof: values.idProof,
          checkIn: values.checkIn.toISOString(),
          checkOut: values.checkOut.toISOString(),
        });
        if (result.success) {
          toast({
            title: 'Hall Booked',
            description: `Hall ${hall.name} has been successfully booked.`,
          });

          // Optimistically update context
          const updatedHall: Hall = {
            ...hall,
            status: 'Booked',
            customerName: values.customerName,
            contact: values.contact,
            purpose: values.purpose,
            email: values.email,
            idProof: values.idProof,
            checkIn: values.checkIn.toISOString(),
            checkOut: values.checkOut.toISOString(),
          };
          setHalls(prev => prev.map(h => h.name === hall.name ? updatedHall : h));
          
          router.push('/hall-management');
        } else {
          throw new Error(result.error || 'Failed to book hall');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to book the hall. Please try again.',
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Book Hall: {hall.name}</CardTitle>
            <CardDescription>Enter the customer's details to book the hall.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="idProof"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>ID Proof</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Aadhar">Aadhar</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="Driving License">Driving License</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="customer@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
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
                            <Textarea placeholder="e.g., Wedding Reception" {...field} />
                        </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                    >
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
                            <FormLabel>Check-out Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={'outline'}
                                    className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                    >
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
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Book Hall
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
