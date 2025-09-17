
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import type { Room } from '@/context/data-provider';
import { parseISO, isWithinInterval, startOfDay } from 'date-fns';

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
      <CardContent className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-grow flex justify-center">
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
        <div className="w-full md:w-1/3 space-y-2">
          <h3 className="font-semibold text-lg mb-2">Occupied Rooms</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {occupiedRooms.length > 0 ? occupiedRooms.map(room => (
              <div key={room.number} className="border p-2 rounded-md">
                <p className="font-semibold">Room {room.number} - <span className="font-normal">{room.guest}</span></p>
                <Badge variant="secondary">{room.checkIn} to {room.checkOut}</Badge>
              </div>
            )) : <p className="text-muted-foreground">No rooms are currently occupied.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
