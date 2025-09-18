
'use client';

import { useTransition, useEffect, useContext, useState } from 'react';
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
  FormDescription,
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
import { format, differenceInHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { updateHall } from '@/app/actions';
import { DataContext, Hall } from '@/context/data-provider';
import Topbar from '@/components/hotel-vista/topbar';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const addOnsList = [
    { id: 'decoration', label: 'Decoration', price: 15000 },
    { id: 'stageSetup', label: 'Stage Setup', price: 8000 },
    { id: 'soundSystem', label: 'Sound System', price: 5000 },
    { id: 'parking', label: 'Parking', price: 3000 },
    { id: 'cleaning', label: 'Cleaning Service', price: 4000 },
  ];
  
const bookHallSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  contact: z.string().min(1, 'Contact number is required'),
  purpose: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  idProof: z.string().min(1, 'ID proof type is required'),
  checkInDate: z.date({ required_error: 'Check-in date is required' }),
  checkOutDate: z.date({ required_error: 'Check-out date is required' }),
  checkInTime: z.string({ required_error: 'Check-in time is required' }),
  checkOutTime: z.string({ required_error: 'Check-out time is required' }),
  adults: z.coerce.number().min(0, 'Cannot be negative'),
  children: z.coerce.number().min(0, 'Cannot be negative'),
  foodPreference: z.enum(['veg', 'non-veg', 'both']).optional(),
  specialRequests: z.string().optional(),
  addOns: z.array(z.string()).optional(),
});

type BookHallFormValues = z.infer<typeof bookHallSchema>;

const ADULT_PRICE = 800;
const CHILD_PRICE = 400;

export default function BookHallPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { halls, setHalls } = useContext(DataContext);
  const [estimatedBill, setEstimatedBill] = useState(0);

  const hallName = decodeURIComponent(params.hallName as string);
  const hall = halls.find(h => h.name === hallName);

  const form = useForm<BookHallFormValues>({
    resolver: zodResolver(bookHallSchema),
    defaultValues: {
      checkInDate: new Date(),
      checkInTime: '10:00',
      checkOutTime: '09:00',
      customerName: '',
      contact: '',
      idProof: '',
      email: '',
      purpose: '',
      adults: 0,
      children: 0,
      foodPreference: 'veg',
      specialRequests: '',
      addOns: [],
    }
  });

  const { watch } = form;
  const watchAllFields = watch();

  useEffect(() => {
    if (!hall) return;
  
    const { checkInDate, checkInTime, checkOutDate, checkOutTime, adults, children, addOns } = watchAllFields;
    
    let total = 0;
  
    // Hall price
    if (checkInDate && checkInTime && checkOutDate && checkOutTime) {
      const start = new Date(`${format(checkInDate, 'yyyy-MM-dd')}T${checkInTime}`);
      const end = new Date(`${format(checkOutDate, 'yyyy-MM-dd')}T${checkOutTime}`);
      if (start < end) {
        const hours = differenceInHours(end, start);
        total += hours * hall.price;
      }
    }
  
    // Food cost
    const foodCost = (adults * ADULT_PRICE) + (children * CHILD_PRICE);
    total += foodCost;
  
    // Add-ons cost
    const addOnsCost = addOns?.reduce((sum, currentId) => {
      const addOn = addOnsList.find(a => a.id === currentId);
      return sum + (addOn?.price || 0);
    }, 0) || 0;
    total += addOnsCost;
    
    setEstimatedBill(total);
  }, [watchAllFields, hall]);


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
        const foodCost = (values.adults * ADULT_PRICE) + (values.children * CHILD_PRICE);
        
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
          checkIn: new Date(`${format(values.checkInDate, 'yyyy-MM-dd')}T${values.checkInTime}`).toISOString(),
          checkOut: new Date(`${format(values.checkOutDate, 'yyyy-MM-dd')}T${values.checkOutTime}`).toISOString(),
          checkInTime: values.checkInTime,
          checkOutTime: values.checkOutTime,
          totalPrice: estimatedBill,
          adults: values.adults,
          children: values.children,
          foodPreference: values.foodPreference,
          specialRequests: values.specialRequests,
          addOns: values.addOns,
          foodCost: foodCost,
        });
        if (result.success && result.hall) {
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
            checkIn: new Date(`${format(values.checkInDate, 'yyyy-MM-dd')}T${values.checkInTime}`).toISOString(),
            checkOut: new Date(`${format(values.checkOutDate, 'yyyy-MM-dd')}T${values.checkOutTime}`).toISOString(),
            checkInTime: values.checkInTime,
            checkOutTime: values.checkOutTime,
            totalPrice: estimatedBill,
            adults: values.adults,
            children: values.children,
            foodPreference: values.foodPreference,
            specialRequests: values.specialRequests,
            addOns: values.addOns,
            foodCost: foodCost,
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
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Book Hall: {hall.name}</CardTitle>
            <CardDescription>Enter the customer's details to book the hall.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Guest Details */}
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-lg font-semibold">Guest Details</h3>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField
                        control={form.control}
                        name="checkInDate"
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
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="checkOutDate"
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
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (watch('checkInDate') || new Date('1900-01-01'))} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                </div>
                </div>
                
                {/* Food Details */}
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-lg font-semibold">Food Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField control={form.control} name="adults" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adults</FormLabel>
                        <FormControl><Input type="number" min="0" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="children" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Children</FormLabel>
                        <FormControl><Input type="number" min="0" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="foodPreference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Preference</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="veg" /></FormControl><FormLabel className="font-normal">Veg</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="non-veg" /></FormControl><FormLabel className="font-normal">Non-Veg</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="both" /></FormControl><FormLabel className="font-normal">Both</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="specialRequests" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Allergen information, specific dishes" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                
                {/* Add-ons */}
                <div className="space-y-4 rounded-md border p-4">
                  <FormField control={form.control} name="addOns" render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-lg font-semibold">Add-ons</FormLabel>
                        <FormDescription>Select any additional services required.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {addOnsList.map((item) => (
                          <FormField key={item.id} control={form.control} name="addOns"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label} (+₹{item.price.toLocaleString()})</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />
                
                {/* Estimated Bill */}
                <div className="flex justify-end text-xl font-bold">
                    <span>Estimated Bill: </span>
                    <span className="ml-2 text-primary">₹{estimatedBill.toLocaleString()}</span>
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
