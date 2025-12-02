
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
import { Building, Users, CalendarDays, DollarSign, ListTree } from 'lucide-react';
import type { Hall } from '@/context/data-provider';
import { format, parseISO, isValid } from 'date-fns';

type HallDetailsModalProps = {
  hall: Hall;
  isOpen: boolean;
  onClose: () => void;
};

const statusColorMap: { [key: string]: string } = {
    Booked: 'bg-red-100 text-red-800 border-red-200',
    Available: 'bg-blue-100 text-blue-800 border-blue-200',
    Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

export function HallDetailsModal({ hall, isOpen, onClose }: HallDetailsModalProps) {
    const colorClass = statusColorMap[hall.status] || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hall: {hall.name}</DialogTitle>
          <DialogDescription>
            Viewing details for the hall.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Status</span>
                <Badge className={`capitalize ${colorClass}`}>{hall.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="font-medium">{hall.capacity} people</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Rate</p>
                        <p className="font-medium">₹{hall.price}/hour</p>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <ListTree className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-sm text-muted-foreground">Facilities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {hall.facilities.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                    </div>
                </div>
            </div>
            {hall.status === 'Booked' && hall.customerName && (
                <>
                    <div className="border-t pt-4 space-y-4">
                         <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium">{hall.customerName}</p>
                            </div>
                        </div>
                        {hall.checkIn && typeof hall.checkIn === 'string' && isValid(parseISO(hall.checkIn)) && hall.checkOut && typeof hall.checkOut === 'string' && isValid(parseISO(hall.checkOut)) && (
                             <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">From</p>
                                        <p className="font-medium">{format(parseISO(hall.checkIn), 'PPP')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">To</p>
                                        <p className="font-medium">{format(parseISO(hall.checkOut), 'PPP')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {hall.totalPrice && (
                            <div className="flex items-center gap-2 border-t pt-4">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Price</p>
                                    <p className="font-medium">₹{hall.totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
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
  );
}
