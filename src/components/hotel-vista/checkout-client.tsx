
'use client';

import React, { useState, useMemo, useContext } from 'react';
import { DataContext, Room } from '@/context/data-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bed, Utensils, Wine, FileText } from 'lucide-react';
import { InvoiceModal } from './invoice-modal';

export default function CheckoutDashboard() {
  const { rooms, recentSales, totalBill } = useContext(DataContext);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const occupiedRooms = useMemo(() => rooms.filter(room => room.status === 'Occupied'), [rooms]);

  const handleRoomSelect = (roomNumber: string) => {
    const room = occupiedRooms.find(r => r.number === roomNumber);
    setSelectedRoom(room || null);
  };

  const charges = useMemo(() => {
    if (!selectedRoom) return null;

    const roomRate = parseFloat(selectedRoom.rate.replace(/[^0-9.-]+/g, ''));
    const barCharges = recentSales
      .filter(sale => sale.room === selectedRoom.number)
      .reduce((acc, sale) => acc + sale.price, 0);
    const restaurantCharges = totalBill
        .filter(bill => bill.room === selectedRoom.number)
        .reduce((acc, bill) => acc + bill.restaurant, 0);

    const grandTotal = roomRate + barCharges + restaurantCharges;

    return {
      room: roomRate,
      bar: barCharges,
      restaurant: restaurantCharges,
      total: grandTotal,
    };
  }, [selectedRoom, recentSales, totalBill]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout & Billing</h1>
          <p className="text-muted-foreground">Generate the final bill for a guest.</p>
        </div>
      </header>

      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Guest Bill</CardTitle>
            <CardDescription>Select a room to generate the final invoice for checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <label htmlFor="room-select" className="font-medium">Select Room:</label>
              <Select onValueChange={handleRoomSelect}>
                <SelectTrigger id="room-select" className="w-[200px]">
                  <SelectValue placeholder="Select a room..." />
                </SelectTrigger>
                <SelectContent>
                  {occupiedRooms.map(room => (
                    <SelectItem key={room.number} value={room.number}>
                      Room {room.number} ({room.guest})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoom && charges && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Bill for {selectedRoom.guest} (Room {selectedRoom.number})</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>Room Charges</span>
                    </div>
                    <span>₹{charges.room.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wine className="h-4 w-4 text-muted-foreground" />
                      <span>Bar Charges</span>
                    </div>
                    <span>₹{charges.bar.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <span>Restaurant Charges</span>
                    </div>
                    <span>₹{charges.restaurant.toFixed(2)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>₹{charges.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button disabled={!selectedRoom} onClick={() => setIsInvoiceModalOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </CardFooter>
        </Card>
      </div>
      {selectedRoom && charges && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          room={selectedRoom}
          charges={charges}
        />
      )}
    </div>
  );
}
