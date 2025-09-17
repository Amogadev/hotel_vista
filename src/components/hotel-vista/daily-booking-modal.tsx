
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Wrench, Bed, User, Calendar, Pencil } from 'lucide-react';
import type { Room } from '@/context/data-provider';
import { format, isSameDay, parseISO } from 'date-fns';
import { Separator } from '../ui/separator';
import { getDailyNote } from '@/app/actions';
import { EditNotesModal } from './edit-notes-modal';

type DailyBookingModalProps = {
  date: Date;
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
  onOccupy: (roomNumber: string) => void;
};

function DailyUpdateItem({ icon, title, rooms, message }: { icon: React.ReactNode, title: string, rooms: Room[], message: string }) {
    return (
        <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">{icon} {title}</h3>
            {rooms.length > 0 ? rooms.map(room => (
                <div key={room.number} className="ml-7 text-sm p-2 border-l-2">Room {room.number} - {room.guest}</div>
            )) : <p className="ml-7 text-sm text-muted-foreground">{message}</p>}
        </div>
    );
}

export function DailyBookingModal({ date, rooms, isOpen, onClose, onOccupy }: DailyBookingModalProps) {
  const formattedDate = format(date, 'MMMM d, yyyy');
  const dateKey = format(date, 'yyyy-MM-dd');
  const [note, setNote] = useState('');
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);

  useEffect(() => {
    if(isOpen) {
      getDailyNote(dateKey).then(res => {
        if(res.success) {
          setNote(res.note);
        }
      })
    }
  }, [isOpen, dateKey]);

  const bookedRooms = rooms.filter(r => 
    r.checkIn && r.checkOut && isSameDay(date, parseISO(r.checkIn))
  );

  const availableRooms = rooms.filter(r => 
    r.status === 'Available' && !bookedRooms.find(br => br.number === r.number)
  );

  const checkIns = rooms.filter(r => r.checkIn && isSameDay(parseISO(r.checkIn), date));
  const checkOuts = rooms.filter(r => r.checkOut && isSameDay(parseISO(r.checkOut), date));
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance');

  const handleNoteUpdated = (newNote: string) => {
    setNote(newNote);
    setIsEditNoteModalOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Bookings for {formattedDate}</DialogTitle>
            <DialogDescription>
              View bookings, available rooms, and daily updates for the selected date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-grow overflow-hidden">
              <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-lg">Daily Summary</h3>
                  <ScrollArea className="flex-grow h-96 pr-4">
                    <div className="space-y-4">
                          <DailyUpdateItem icon={<LogIn className="w-5 h-5 text-green-500" />} title="Check-ins" rooms={checkIns} message="No check-ins today." />
                          <DailyUpdateItem icon={<LogOut className="w-5 h-5 text-red-500" />} title="Check-outs" rooms={checkOuts} message="No check-outs today." />
                          <DailyUpdateItem icon={<Wrench className="w-5 h-5 text-yellow-500" />} title="Maintenance" rooms={maintenanceRooms} message="No maintenance scheduled." />
                          <div>
                              <h3 className="font-semibold flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <Bed className="w-5 h-5 text-blue-500" /> Special Notes
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditNoteModalOpen(true)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                              </h3>
                              <p className="ml-7 text-sm text-muted-foreground whitespace-pre-wrap">
                                {note || "No special events or notes for today."}
                              </p>
                          </div>
                      </div>
                  </ScrollArea>
              </div>
              <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-lg">Room Status</h3>
                  <ScrollArea className="flex-grow h-96 pr-4">
                      <div className="space-y-4">
                          <div>
                              <h4 className="font-medium text-muted-foreground mb-2">Booked Rooms</h4>
                              {bookedRooms.length > 0 ? bookedRooms.map(room => (
                                  <div key={room.number} className="p-3 border rounded-lg bg-muted/50 mb-2">
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <p className="font-bold text-primary">Room {room.number}</p>
                                              <p className="text-sm text-muted-foreground">{room.type}</p>
                                          </div>
                                          <Badge>{room.status}</Badge>
                                      </div>
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                          <div className="flex items-center gap-2"><User className="w-4 h-4"/>{room.guest}</div>
                                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{format(parseISO(room.checkIn!), 'MMM d')} - {format(parseISO(room.checkOut!), 'MMM d')}</div>
                                      </div>
                                  </div>
                              )) : <p className="text-center text-muted-foreground py-4">No rooms booked for this date.</p>}
                          </div>
                          <Separator />
                          <div>
                              <h4 className="font-medium text-muted-foreground mb-2">Available Rooms</h4>
                              {availableRooms.length > 0 ? availableRooms.map(room => (
                                  <div key={room.number} className="p-3 border rounded-lg flex justify-between items-center mb-2">
                                      <div>
                                          <p className="font-bold text-green-600">Room {room.number}</p>
                                          <p className="text-sm text-muted-foreground">{room.type}</p>
                                      </div>
                                      <Button size="sm" onClick={() => onOccupy(room.number)}>Book Now</Button>
                                  </div>
                              )) : <p className="text-center text-muted-foreground py-4">No rooms available for this date.</p>}
                          </div>
                      </div>
                  </ScrollArea>
              </div>
          </div>
        </DialogContent>
      </Dialog>
      <EditNotesModal 
        isOpen={isEditNoteModalOpen}
        onClose={() => setIsEditNoteModalOpen(false)}
        date={date}
        initialNote={note}
        onNoteUpdated={handleNoteUpdated}
      />
    </>
  );
}
