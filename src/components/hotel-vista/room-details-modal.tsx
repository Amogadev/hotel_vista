
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
import { Bed, User, CalendarDays, DollarSign, Tag, Info } from 'lucide-react';

type Room = {
    number: string;
    type: string;
    status: string;
    guest?: string;
    checkIn?: string;
    checkOut?: string;
    rate: string;
};

type RoomDetailsModalProps = {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
};

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Occupied: 'secondary',
    Available: 'default',
    Cleaning: 'outline',
    Maintenance: 'destructive',
  };
  
const statusColorMap: { [key: string]: string } = {
    Occupied: 'bg-green-400 text-green-950 border-green-500',
    Available: 'bg-blue-400 text-blue-950 border-blue-500',
    Cleaning: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    Maintenance: 'bg-red-400 text-red-950 border-red-500',
};

export function RoomDetailsModal({ room, isOpen, onClose }: RoomDetailsModalProps) {
  if (!room) return null;

  const variant = statusVariantMap[room.status] || 'default';
  const colorClass = statusColorMap[room.status] || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Bed className="h-6 w-6" /> Room {room.number}
          </DialogTitle>
          <DialogDescription>
            Detailed information for the selected room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className='flex items-center gap-2'>
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Status</span>
                </div>
                <Badge variant={variant} className={`capitalize ${colorClass}`}>{room.status}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className='flex items-center gap-2'>
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Type</span>
                </div>
                <span className='font-semibold'>{room.type}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className='flex items-center gap-2'>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Rate</span>
                </div>
                <span className='font-semibold'>{room.rate}</span>
            </div>
          {room.guest && (
            <div className="grid gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Guest</span>
                    </div>
                    <span className='font-semibold'>{room.guest}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Check-in</span>
                    </div>
                    <span className='font-semibold'>{room.checkIn}</span>
                </div>
                <div className="flex items-center justify-between">
                     <div className='flex items-center gap-2'>
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Check-out</span>
                    </div>
                    <span className='font-semibold'>{room.checkOut}</span>
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
