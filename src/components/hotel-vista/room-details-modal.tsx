
'use client';

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
import { Bed, Users, CalendarDays, DollarSign } from 'lucide-react';
import type { Room } from '@/context/data-provider';

type RoomDetailsModalProps = {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
};

const statusColorMap: { [key: string]: string } = {
    Occupied: 'bg-green-400 text-green-950 border-green-500',
    Available: 'bg-blue-400 text-blue-950 border-blue-500',
    Cleaning: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    Maintenance: 'bg-red-800 text-white border-red-900',
  };

export function RoomDetailsModal({ room, isOpen, onClose }: RoomDetailsModalProps) {
    const colorClass = statusColorMap[room.status] || '';

  return (
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
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Guest</p>
                                <p className="font-medium">{room.guest}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Check-in</p>
                                <p className="font-medium">{room.checkIn}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Check-out</p>
                                <p className="font-medium">{room.checkOut}</p>
                            </div>
                        </div>
                    </div>
                    {room.totalPrice && (
                         <div className="flex items-center gap-2 border-t pt-4">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Price</p>
                                <p className="font-medium">₹{room.totalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
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
  );
}
