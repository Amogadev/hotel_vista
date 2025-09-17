
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Wrench, Bed, User, Users, Calendar, DollarSign } from 'lucide-react';
import type { Room } from '@/context/data-provider';
import { format, isSameDay, parseISO } from 'date-fns';

type DailyBookingModalProps = {
  date: Date;
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
  onOccupy: (roomNumber: string) => void;
};

export function DailyBookingModal({ date, rooms, isOpen, onClose, onOccupy }: DailyBookingModalProps) {
  const formattedDate = format(date, 'MMMM d, yyyy');

  const bookedRooms = rooms.filter(r => 
    r.checkIn && r.checkOut && isSameDay(date, parseISO(r.checkIn))
  );

  const availableRooms = rooms.filter(r => 
    r.status === 'Available' && !bookedRooms.find(br => br.number === r.number)
  );

  const checkIns = rooms.filter(r => r.checkIn && isSameDay(parseISO(r.checkIn), date));
  const checkOuts = rooms.filter(r => r.checkOut && isSameDay(parseISO(r.checkOut), date));
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bookings for {formattedDate}</DialogTitle>
          <DialogDescription>
            View bookings, available rooms, and daily updates.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="bookings" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="available">Available Rooms</TabsTrigger>
            <TabsTrigger value="updates">Daily Updates</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-grow mt-4">
            <TabsContent value="bookings" className="p-1">
              <div className="space-y-4">
                {bookedRooms.length > 0 ? bookedRooms.map(room => (
                  <div key={room.number} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-primary">Room {room.number}</p>
                            <p className="text-sm text-muted-foreground">{room.type}</p>
                        </div>
                        <Badge>{room.status}</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2"><User className="w-4 h-4"/>{room.guest}</div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4"/>{room.peopleCount} people</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{format(parseISO(room.checkIn!), 'MMM d')} - {format(parseISO(room.checkOut!), 'MMM d')}</div>
                         <div className="flex items-center gap-2"><DollarSign className="w-4 h-4"/>₹{room.totalPrice}</div>
                    </div>
                  </div>
                )) : <p className="text-center text-muted-foreground py-8">No rooms booked for this date.</p>}
              </div>
            </TabsContent>
            <TabsContent value="available">
               <div className="space-y-4">
                {availableRooms.length > 0 ? availableRooms.map(room => (
                  <div key={room.number} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-bold text-green-600">Room {room.number}</p>
                        <p className="text-sm text-muted-foreground">{room.type}</p>
                    </div>
                    <Button size="sm" onClick={() => onOccupy(room.number)}>Book Now</Button>
                  </div>
                )) : <p className="text-center text-muted-foreground py-8">No rooms available for this date.</p>}
                 <div className="p-4 border rounded-lg flex justify-between items-center mt-4">
                    <p className="font-bold">Need to book for a future date?</p>
                    <Button>Add New Booking</Button>
                 </div>
              </div>
            </TabsContent>
            <TabsContent value="updates">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><LogIn className="w-5 h-5 text-green-500" />Check-ins Scheduled</h3>
                        {checkIns.length > 0 ? checkIns.map(room => (
                            <div key={room.number} className="ml-7 text-sm p-2 border-l-2 border-green-500">Room {room.number} - {room.guest}</div>
                        )) : <p className="ml-7 text-sm text-muted-foreground">No check-ins today.</p>}
                    </div>
                     <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><LogOut className="w-5 h-5 text-red-500" />Check-outs Scheduled</h3>
                        {checkOuts.length > 0 ? checkOuts.map(room => (
                            <div key={room.number} className="ml-7 text-sm p-2 border-l-2 border-red-500">Room {room.number} - {room.guest}</div>
                        )) : <p className="ml-7 text-sm text-muted-foreground">No check-outs today.</p>}
                    </div>
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Wrench className="w-5 h-5 text-yellow-500" />Maintenance Tasks</h3>
                        {maintenanceRooms.length > 0 ? maintenanceRooms.map(room => (
                             <div key={room.number} className="ml-7 text-sm p-2 border-l-2 border-yellow-500">Room {room.number} - Scheduled Maintenance</div>
                        )) : <p className="ml-7 text-sm text-muted-foreground">No maintenance scheduled.</p>}
                    </div>
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Bed className="w-5 h-5 text-blue-500" />Special Notes</h3>
                        <p className="ml-7 text-sm text-muted-foreground">No special events or notes for today.</p>
                    </div>
                </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

