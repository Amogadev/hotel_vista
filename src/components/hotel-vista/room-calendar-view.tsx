
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Room } from '@/context/data-provider';
import { parseISO, isWithinInterval, startOfDay, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { DailyBookingModal } from './daily-booking-modal';
import { useRouter } from 'next/navigation';

type RoomCalendarViewProps = {
  rooms: Room[];
};

export function RoomCalendarView({ rooms }: RoomCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();

  const handleOccupyClick = (roomNumber: string) => {
    router.push(`/occupy/${roomNumber}`);
    if (selectedDate) {
        setSelectedDate(null);
    }
  };
  
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied' && r.checkIn && r.checkOut);
  const allRoomsCount = rooms.length;

  const bookingsByDate: { [key: string]: Room[] } = {};
  occupiedRooms.forEach(room => {
    if (room.checkIn && room.checkOut) {
        const start = startOfDay(parseISO(room.checkIn));
        const end = startOfDay(parseISO(room.checkOut));
        if (start && end) {
            const interval = eachDayOfInterval({ start, end });
            interval.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            if (!bookingsByDate[dateKey]) {
                bookingsByDate[dateKey] = [];
            }
            bookingsByDate[dateKey].push(room);
            });
        }
    }
  });

  const getDayStatus = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const bookings = bookingsByDate[dateKey] || [];
    // This logic assumes maintenance rooms are unavailable for the whole day.
    // A more complex system might have start/end dates for maintenance.
    const maintenanceForDay = rooms.filter(r => r.status === 'Maintenance');
    
    const todaysBookings = bookings.length + maintenanceForDay.length;

    if (todaysBookings >= allRoomsCount) return 'fully-booked';
    if (todaysBookings > 0) return 'partially-booked';
    return 'available';
  };

  const DayContent = (props: { day: Date }) => {
    const status = getDayStatus(props.day);
    let colorClass = '';
    switch(status) {
      case 'fully-booked': colorClass = 'bg-red-500'; break;
      case 'partially-booked': colorClass = 'bg-yellow-500'; break;
      case 'available': colorClass = 'bg-green-500'; break;
    }

    return (
      <div className="relative w-full h-full">
        <span className={ `absolute top-0.5 right-0.5 h-2 w-2 rounded-full ${colorClass}` }></span>
        {format(props.day, 'd')}
      </div>
    );
  };

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Booking Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-grow rounded-lg border p-4 flex justify-center bg-muted/50">
                    <Calendar
                        mode="single"
                        numberOfMonths={2}
                        onSelect={(day) => day && setSelectedDate(day)}
                        className="p-3"
                        components={{
                            DayContent: (props) => <DayContent day={props.date} />,
                        }}
                        modifiers={{
                            selected: selectedDate ? (day => isSameDay(day, selectedDate)) : undefined,
                        }}
                        modifiersClassNames={{
                            selected: 'bg-primary/20 rounded-full',
                        }}
                    />
                </div>
                <div className="w-full lg:w-1/3 space-y-2">
                <h3 className="font-semibold text-lg mb-2 border-b pb-2">Calendar Legend</h3>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-green-500" />
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-yellow-500" />
                        <span>Partially Booked / Maintenance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-red-500" />
                        <span>Fully Booked</span>
                    </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 border-b pb-2 mt-4">Upcoming Bookings</h3>
                <ScrollArea className="h-72">
                    <div className="space-y-3 pr-4">
                        {occupiedRooms.length > 0 ? occupiedRooms.map(room => (
                        <div key={room.number} className="border p-3 rounded-lg bg-muted/50">
                            <p className="font-semibold text-primary">Room {room.number}</p>
                            <p className="text-sm font-medium">{room.guest}</p>
                            {room.checkIn && room.checkOut &&
                                <Badge variant="secondary" className="mt-1">{format(parseISO(room.checkIn), 'MMM d')} to {format(parseISO(room.checkOut), 'MMM d')}</Badge>
                            }
                        </div>
                        )) : <p className="text-muted-foreground p-3 text-center">No rooms are currently occupied.</p>}
                    </div>
                </ScrollArea>
                </div>
            </CardContent>
        </Card>
        {selectedDate && (
            <DailyBookingModal
                date={selectedDate}
                rooms={rooms}
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                onOccupy={handleOccupyClick}
            />
        )}
    </>
  );
}
