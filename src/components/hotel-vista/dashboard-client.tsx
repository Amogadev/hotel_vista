
"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataContext, Room, Transaction } from "@/context/data-provider";
import { isWithinInterval, startOfDay, endOfDay, parseISO, format, isFuture, isValid, isSameDay } from 'date-fns';

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
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";


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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole');
      if (!userRole) {
        router.push('/login');
      }
    }
  }, [router]);

  const stats = useMemo(() => {
    const date = selectedDate || new Date();

    const dailyTransactions: Transaction[] = [];
    rooms.forEach(room => {
        room.transactions?.forEach(tx => {
            if (tx.date && typeof tx.date === 'string' && isSameDay(parseISO(tx.date), date)) {
                dailyTransactions.push(tx);
            }
        });
    });
    const dailyRevenue = dailyTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    
    let occupiedRoomsCount = 0;
    let activeGuestsCount = 0;

    rooms.forEach(room => {
        if (room.status === 'Occupied' && room.checkIn && room.checkOut) {
            const checkInDate = typeof room.checkIn === 'string' ? parseISO(room.checkIn) : room.checkIn;
            const checkOutDate = typeof room.checkOut === 'string' ? parseISO(room.checkOut) : room.checkOut;
            if (isValid(checkInDate) && isValid(checkOutDate)) {
                 if (isWithinInterval(date, { start: startOfDay(checkInDate), end: endOfDay(checkOutDate) })) {
                    occupiedRoomsCount++;
                    activeGuestsCount += room.peopleCount || 1;
                }
            }
        }
    });

    const restaurantOrdersCount = activeOrders.filter(order => order.time && isSameDay(parseISO(order.time), date)).length;

    return [
        {
          title: `Revenue for ${format(date, 'MMM d')}`,
          value: `₹${dailyRevenue.toLocaleString()}`,
          trend: `from ${dailyTransactions.length} transactions`,
          trendColor: "text-muted-foreground",
          icon: <DollarSign className="h-5 w-5 text-green-500" />,
        },
        {
          title: "Occupied Rooms",
          value: `${occupiedRoomsCount} / ${rooms.length}`,
          trend: `on ${format(date, 'PPP')}`,
          trendColor: "text-muted-foreground",
          icon: <BedDouble className="h-5 w-5 text-blue-500" />,
        },
        {
          title: "Active Guests",
          value: `${activeGuestsCount}`,
          trend: `on ${format(date, 'PPP')}`,
          trendColor: "text-muted-foreground",
          icon: <Users className="h-5 w-5 text-orange-500" />,
        },
        {
          title: "Restaurant Orders",
          value: `${restaurantOrdersCount}`,
          trend: `on ${format(date, 'PPP')}`,
          trendColor: "text-muted-foreground",
          icon: <UtensilsCrossed className="h-5 w-5 text-yellow-500" />,
        },
      ];
  }, [selectedDate, rooms, activeOrders]);


  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h1>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(day) => {
                            setSelectedDate(day);
                            setIsDatePickerOpen(false);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </header>

        <main className="flex flex-1 flex-col gap-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

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
