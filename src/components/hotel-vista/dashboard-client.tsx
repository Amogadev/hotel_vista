
"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataContext, Room } from "@/context/data-provider";
import { isWithinInterval, startOfDay, endOfDay, parseISO, format } from 'date-fns';

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
          const checkInDate = startOfDay(parseISO(room.checkIn));
          const checkOutDate = endOfDay(parseISO(room.checkOut));
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
  const occupiedRooms = rooms.filter(room => room.status === 'Occupied').length;
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
          <div className="grid gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center">
                      <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                      />
                  </CardContent>
              </Card>
          </div>

          {selectedDate && (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Room Status for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                            <CardDescription>
                                {occupiedRoomsForDate.length} occupied, {availableRooms.length} available.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 max-h-[400px]">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-red-600">Occupied Rooms ({occupiedRoomsForDate.length})</h3>
                        <ScrollArea className="h-full max-h-80 rounded-md border p-2">
                            {occupiedRoomsForDate.length > 0 ? (
                                <div className="space-y-2">
                                {occupiedRoomsForDate.map(room => (
                                    <div key={room.number} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                        <div className="flex items-center gap-2">
                                            <Bed className="h-4 w-4" />
                                            <p className="font-semibold">{room.number}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4"/>
                                            <p>{room.guest}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground p-4">No rooms occupied on this day.</p>
                            )}
                        </ScrollArea>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-semibold text-green-600">Available Rooms ({availableRooms.length})</h3>
                        <ScrollArea className="h-full max-h-80 rounded-md border p-2">
                            {availableRooms.length > 0 ? (
                                <div className="space-y-2">
                                {availableRooms.map(room => (
                                    <div key={room.number} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                        <div className="flex items-center gap-2">
                                            <Bed className="h-4 w-4" />
                                            <p className="font-semibold">{room.number}</p>
                                        </div>
                                        <Badge variant="outline">{room.type}</Badge>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground p-4">No rooms available on this day.</p>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
          )}

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
    </>
  );
}
