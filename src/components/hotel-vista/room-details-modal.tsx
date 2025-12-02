
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Users, CalendarDays, DollarSign, Wallet } from 'lucide-react';
import type { Room, Transaction } from '@/context/data-provider';
import { format, parseISO, isValid } from 'date-fns';
import { Separator } from '../ui/separator';
import { ManagePaymentModal } from './manage-payment-modal';

type RoomDetailsModalProps = {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated: (roomNumber: string, newPaidAmount: number, transactions: Transaction[]) => void;
};

const statusColorMap: { [key: string]: string } = {
    Occupied: 'bg-green-100 text-green-800 border-green-200',
    Available: 'bg-blue-100 text-blue-800 border-blue-200',
    Cleaning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Maintenance: 'bg-red-100 text-red-800 border-red-200',
    Booked: 'bg-red-100 text-red-800 border-red-200',
  };

export function RoomDetailsModal({ room, isOpen, onClose, onPaymentUpdated }: RoomDetailsModalProps) {
    const colorClass = statusColorMap[room.status] || '';
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const balanceDue = (room.totalPrice || 0) - (room.paidAmount || 0);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Room {room.number} Details</DialogTitle>
          <DialogDescription>
            Viewing details for {room.type} room.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Status</span>
                <Badge className={`capitalize ${colorClass}`}>{room.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{room.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Rate</p>
                        <p className="font-medium">₹{room.price}/night</p>
                    </div>
                </div>
            </div>
            {room.status === 'Occupied' && room.guest && (
                <>
                    <Separator />
                    <div className="space-y-4">
                         <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Guest</p>
                                <p className="font-medium">{room.guest}</p>
                            </div>
                        </div>
                        {room.checkIn && typeof room.checkIn === 'string' && isValid(parseISO(room.checkIn)) && room.checkOut && typeof room.checkOut === 'string' && isValid(parseISO(room.checkOut)) && (
                             <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Check-in</p>
                                        <p className="font-medium">{format(parseISO(room.checkIn), 'PPP')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Check-out</p>
                                        <p className="font-medium">{format(parseISO(room.checkOut), 'PPP')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Separator />
                     <div className="space-y-3 rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Payment Status</h4>
                            <Button variant="outline" size="sm" className="h-7" onClick={() => setIsPaymentModalOpen(true)}>
                                <Wallet className="mr-2 h-3 w-3" /> Manage
                            </Button>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Bill</span>
                            <span className="font-medium">₹{(room.totalPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount Paid</span>
                            <span className="font-medium text-green-600">₹{(room.paidAmount || 0).toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between text-sm font-bold">
                            <span className="text-muted-foreground">Balance Due</span>
                            <span className={balanceDue > 0 ? "text-red-600" : ""}>₹{balanceDue.toLocaleString()}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     {room && (
        <ManagePaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            room={room}
            onPaymentUpdated={onPaymentUpdated}
        />
     )}
    </>
  );
}
