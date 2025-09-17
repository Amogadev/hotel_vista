
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Room } from '@/context/data-provider';
import { parseISO, isWithinInterval, startOfDay, format } from 'date-fns';

type RoomCalendarViewProps = {
  rooms: Room[];
};

export function RoomCalendarView({ rooms }: RoomCalendarViewProps) {
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied' && r.checkIn && r.checkOut);

  const isDayOccupied = (day: Date) => {
    return occupiedRooms.some(room => {
      const start = startOfDay(parseISO(room.checkIn!));
      const end = startOfDay(parseISO(room.checkOut!));
      return isWithinInterval(day, { start, end });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-grow flex justify-center rounded-lg border">
            <Calendar
                mode="range"
                numberOfMonths={2}
                className="p-3"
                modifiers={{
                    occupied: isDayOccupied,
                }}
                modifiersClassNames={{
                    occupied: 'bg-destructive/20 text-destructive-foreground rounded-full',
                }}
            />
        </div>
        <div className="w-full lg:w-1/3 space-y-2">
          <h3 className="font-semibold text-lg mb-2 border-b pb-2">Upcoming Bookings</h3>
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
                {occupiedRooms.length > 0 ? occupiedRooms.map(room => (
                <div key={room.number} className="border p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold text-primary">Room {room.number}</p>
                    <p className="text-sm font-medium">{room.guest}</p>
                    <Badge variant="secondary" className="mt-1">{format(parseISO(room.checkIn!), 'MMM d')} to {format(parseISO(room.checkOut!), 'MMM d')}</Badge>
                </div>
                )) : <p className="text-muted-foreground p-3 text-center">No rooms are currently occupied.</p>}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
