
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
import { updateRoom } from '@/app/actions';
import { DataContext, Room } from '@/context/data-provider';
import Topbar from '@/components/hotel-vista/topbar';

const occupySchema = z.object({
  guest: z.string().min(1, 'Guest name is required'),
  peopleCount: z.coerce.number().min(1, 'Number of people must be at least 1'),
  idProof: z.string().min(1, 'ID proof type is required'),
  email: z.string().email('Invalid email address'),
  checkIn: z.date({ required_error: 'Check-in date is required' }),
  checkOut: z.date({ required_error: 'Check-out date is required' }),
});

type OccupyFormValues = z.infer<typeof occupySchema>;

export default function OccupyRoomPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { rooms, setRooms } = useContext(DataContext);

  const roomNumber = params.roomNumber as string;
  const room = rooms.find(r => r.number === roomNumber);

  const form = useForm<OccupyFormValues>({
    resolver: zodResolver(occupySchema),
  });

  const { watch } = form;
  const checkIn = watch('checkIn');

  if (!room) {
    return (
        <div className="flex flex-col min-h-screen">
            <Topbar />
            <main className="flex-1 pt-14 flex items-center justify-center">
                <p>Room not found.</p>
            </main>
      </div>
    );
  }

  const onSubmit = (values: OccupyFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateRoom({
          originalNumber: room.number,
          number: room.number,
          type: room.type,
          price: room.price,
          status: 'Occupied',
          guest: values.guest,
          peopleCount: values.peopleCount,
          idProof: values.idProof,
          email: values.email,
          checkIn: values.checkIn.toISOString(),
          checkOut: values.checkOut.toISOString(),
        });
        if (result.success) {
          toast({
            title: 'Room Occupied',
            description: `Room ${room.number} has been successfully occupied.`,
          });

          // Optimistically update context
          const updatedRoom: Room = {
            ...room,
            status: 'Occupied',
            guest: values.guest,
            peopleCount: values.peopleCount,
            idProof: values.idProof,
            email: values.email,
            checkIn: values.checkIn.toISOString(),
            checkOut: values.checkOut.toISOString(),
          };
          setRooms(prev => prev.map(r => r.number === room.number ? updatedRoom : r));
          
          router.push('/room-management');
        } else {
          throw new Error(result.error || 'Failed to occupy room');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to occupy the room. Please try again.',
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
            <CardTitle>Occupy Room {room.number}</CardTitle>
            <CardDescription>Enter the guest's details to check them in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="guest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="peopleCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of People</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
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
                            <Input type="email" placeholder="guest@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

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
                    Save & Occupy Room
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

    