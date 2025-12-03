
"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataContext, Room } from "@/context/data-provider";
import { isWithinInterval, startOfDay, endOfDay, parseISO, format, isFuture, isValid } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "./stat-card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  BedDouble,
  Users,
  UtensilsCrossed,
  Wine,
  Plus,
  X as XIcon,
  User,
  Bed,
} from "lucide-react";
import Link from "next/link";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { DailyBookingModal } from './daily-booking-modal';


const chartData = [
    { name: 'Jan', revenue: 32000 },
    { name: 'Feb', revenue: 38000 },
    { name: 'Mar', revenue: 42000 },
    { name: 'Apr', revenue: 39000 },
    { name: 'May', revenue: 45000 },
    { name: 'Jun', revenue: 48000 },
];

export default function Dashboard() {
  const { rooms, activeOrders } = useContext(DataContext);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDailyBookingModalOpen, setIsDailyBookingModalOpen] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole');
      if (!userRole) {
        router.push('/login');
      }
    }
  }, [router]);

  const { availableRooms, occupiedRoomsForDate } = useMemo(() => {
    if (!selectedDate) {
      return { availableRooms: [], occupiedRoomsForDate: [] };
    }

    const occupiedNumbers = new Set<string>();

    const occupied = rooms.filter(room => {
      if (room.status === 'Occupied' && room.checkIn && room.checkOut) {
        try {
          const checkInDate = startOfDay(typeof room.checkIn === 'string' ? parseISO(room.checkIn) : room.checkIn);
          const checkOutDate = endOfDay(typeof room.checkOut === 'string' ? parseISO(room.checkOut) : room.checkOut);
          if (isWithinInterval(selectedDate, { start: checkInDate, end: checkOutDate })) {
            occupiedNumbers.add(room.number);
            return true;
          }
        } catch (e) {
            console.error("Invalid date format for room", room.number, e);
            return false;
        }
      }
      return false;
    });

    const available = rooms.filter(room => room.status === 'Available' && !occupiedNumbers.has(room.number));

    return { availableRooms: available, occupiedRoomsForDate: occupied };
  }, [selectedDate, rooms]);


  const totalRevenue = rooms
  .filter(room => room.status === 'Occupied')
  .reduce((acc, room) => acc + (room.totalPrice || room.price), 0);
  const occupiedRooms = rooms.filter(room => room.status === 'Occupied' && (!room.checkIn || typeof room.checkIn !== 'string' || !isValid(parseISO(room.checkIn)) || !isFuture(startOfDay(parseISO(room.checkIn))))).length;
  const bookedRooms = rooms.filter(room => room.status === 'Occupied' && room.checkIn && typeof room.checkIn === 'string' && isValid(parseISO(room.checkIn)) && isFuture(startOfDay(parseISO(room.checkIn)))).length;
  const totalRooms = rooms.length;
  const activeGuests = rooms.filter(room => room.status === 'Occupied' && room.guest).length; // Simplified guest count
  const restaurantOrders = activeOrders.length;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      trend: "+12.5% from last month",
      trendColor: "text-green-600",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Occupied Rooms",
      value: `${occupiedRooms} / ${totalRooms}`,
      trend: "+6.3% from last month",
      trendColor: "text-blue-600",
      icon: <BedDouble className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Active Guests",
      value: `${activeGuests}`,
      trend: "+8.2% from last month",
      trendColor: "text-orange-600",
      icon: <Users className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Restaurant Orders",
      value: `${restaurantOrders}`,
      trend: "+15.3% from last month",
      trendColor: "text-yellow-600",
      icon: <UtensilsCrossed className="h-5 w-5 text-yellow-500" />,
    },
  ];

  const handleOccupyClick = (roomNumber: string) => {
    router.push(`/occupy/${roomNumber}`);
    if (isDailyBookingModalOpen) {
        setIsDailyBookingModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>Select a date to see room availability.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-1 flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    className="p-3 rounded-md border"
                    initialFocus
                />
              </div>
              {selectedDate && (
                <div className="w-full md:w-1/3 lg:w-1/4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">Room Status for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                      <p className="text-xs text-muted-foreground">
                        {occupiedRoomsForDate.length} occupied, {availableRooms.length} available.
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <h4 className="font-medium text-xs text-red-600">Occupied ({occupiedRoomsForDate.length})</h4>
                      <ScrollArea className="h-24 rounded-md border p-1">
                        {occupiedRoomsForDate.length > 0 ? (
                          <div className="space-y-1">
                            {occupiedRoomsForDate.map(room => (
                              <div key={room.number} className="flex items-center justify-between p-1 rounded-md bg-muted text-[10px]">
                                <p className="font-semibold">{room.number}</p>
                                <p className="truncate">{room.guest}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-xs text-muted-foreground pt-4">No rooms occupied.</p>
                        )}
                      </ScrollArea>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-xs text-green-600">Available ({availableRooms.length})</h4>
                      <ScrollArea className="h-24 rounded-md border p-1">
                        {availableRooms.length > 0 ? (
                          <div className="space-y-1">
                            {availableRooms.map(room => (
                              <div key={room.number} className="flex items-center justify-between p-1 rounded-md bg-muted text-[10px]">
                                <p className="font-semibold">{room.number}</p>
                                <Badge variant="outline" className="text-[9px] px-1 py-0">{room.type}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-xs text-muted-foreground pt-4">No rooms available.</p>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip
                      contentStyle={{ 
                          borderRadius: '0.5rem', 
                          border: '1px solid hsl(var(--border))', 
                          background: 'hsl(var(--background))' 
                      }}
                      labelStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card>
                  <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                      <Button asChild variant="outline">
                          <Link href="/room-management">Add New Room <Plus className="ml-auto" /></Link>
                      </Button>
                      <Button asChild variant="outline">
                          <Link href="/bar-liquor">Record Bar Sale <Wine className="ml-auto" /></Link>
                      </Button>
                      <Button asChild variant="outline">
                          <Link href="/restaurant">New Restaurant Order <UtensilsCrossed className="ml-auto" /></Link>
                      </Button>
                  </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      {selectedDate && (
        <DailyBookingModal
            date={selectedDate}
            rooms={rooms}
            isOpen={isDailyBookingModalOpen}
            onClose={() => setIsDailyBookingModalOpen(false)}
            onOccupy={handleOccupyClick}
        />
      )}
    </>
  );
}
