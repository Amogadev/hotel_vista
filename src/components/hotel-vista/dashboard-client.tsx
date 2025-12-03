

"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataContext, Room, Transaction } from "@/context/data-provider";
import { isWithinInterval, startOfDay, endOfDay, parseISO, format, isFuture, isValid, isSameDay } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "./stat-card";
import {
  DollarSign,
  BedDouble,
  Users,
  UtensilsCrossed,
  Wine,
  Plus,
  CalendarIcon,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";


const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
        case 'card':
            return <CreditCard className="h-4 w-4 text-blue-500" />;
        case 'cash':
            return <Banknote className="h-4 w-4 text-green-500" />;
        case 'upi':
        case 'upi / qr':
        case 'gpay':
            return <Smartphone className="h-4 w-4 text-purple-500" />;
        default:
            return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
};


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

  const dailyData = useMemo(() => {
    const date = selectedDate || new Date();
    const dailyTransactions: (Transaction & { roomNumber?: string, guest?: string})[] = [];
    
    rooms.forEach(room => {
        room.transactions?.forEach(tx => {
            if (tx.date && typeof tx.date === 'string' && isValid(parseISO(tx.date)) && isSameDay(parseISO(tx.date), date)) {
                dailyTransactions.push({ ...tx, roomNumber: room.number, guest: room.guest });
            }
        });
    });
    
    const dummyTransactions: (Transaction & { roomNumber?: string, guest?: string})[] = [
        { date: date.toISOString(), amount: 1250, method: 'UPI', roomNumber: '101', guest: 'John Doe' },
        { date: date.toISOString(), amount: 8500, method: 'Card', roomNumber: '205', guest: 'Jane Smith' },
        { date: date.toISOString(), amount: 3200, method: 'Cash', roomNumber: '302', guest: 'Peter Jones' },
    ];

    const transactionsToDisplay = dailyTransactions.length > 0 ? dailyTransactions : dummyTransactions;

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

    return {
        stats: [
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
        ],
        transactions: transactionsToDisplay,
    }
  }, [selectedDate, rooms, activeOrders]);


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
            {dailyData.stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
             <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daily Payment Details</CardTitle>
                        <CardDescription>Breakdown of payments for {selectedDate ? format(selectedDate, 'PPP') : 'today'}.</CardDescription>
                    </div>
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
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room/Guest</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {dailyData.transactions.length > 0 ? (
                                dailyData.transactions.map((tx, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="font-medium">Room {tx.roomNumber}</div>
                                            <div className="text-sm text-muted-foreground">{tx.guest}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getPaymentMethodIcon(tx.method)}
                                                <span>{tx.method}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">₹{tx.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                           ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                    No payments recorded for this day.
                                </TableCell>
                            </TableRow>
                           )}
                        </TableBody>
                    </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
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
        </main>
      </div>
    </>
  );
}
