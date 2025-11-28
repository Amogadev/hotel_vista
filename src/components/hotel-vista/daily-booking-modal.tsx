
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Wrench, Bed, User, Calendar, Pencil, Sparkles } from 'lucide-react';
import type { Room } from '@/context/data-provider';
import { format, isSameDay, parseISO } from 'date-fns';
import { Separator } from '../ui/separator';
import { getDailyNote } from '@/lib/rooms-service';
import { EditNotesModal } from './edit-notes-modal';
import { cn } from '@/lib/utils';

type DailyBookingModalProps = {
  date: Date;
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
  onOccupy: (roomNumber: string) => void;
};

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
        <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Daily Overview: {formattedDate}</DialogTitle>
            <DialogDescription>
              A snapshot of all hotel activities for the selected date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
            <ScrollArea className="h-full pr-6 -mr-6">
               {/* Daily Updates Section */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Daily Updates</h3>
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <LogIn className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Check-ins</h4>
                      {checkIns.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {checkIns.map(r => <Badge key={r.number} variant="outline">Room {r.number} - {r.guest}</Badge>)}
                        </div>
                      ) : <p className="text-sm text-muted-foreground">No check-ins today.</p>}
                    </div>
                  </div>
                  <Separator/>
                  <div className="flex items-start gap-4">
                    <LogOut className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Check-outs</h4>
                       {checkOuts.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {checkOuts.map(r => <Badge key={r.number} variant="outline" className="border-red-200 text-red-700">Room {r.number} - {r.guest}</Badge>)}
                        </div>
                      ) : <p className="text-sm text-muted-foreground">No check-outs today.</p>}
                    </div>
                  </div>
                   <Separator/>
                  <div className="flex items-start gap-4">
                    <Wrench className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Maintenance</h4>
                       {maintenanceRooms.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {maintenanceRooms.map(r => <Badge key={r.number} variant="outline"  className="border-yellow-200 text-yellow-700">Room {r.number}</Badge>)}
                        </div>
                      ) : <p className="text-sm text-muted-foreground">No maintenance scheduled.</p>}
                    </div>
                  </div>
                  <Separator/>
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Special Notes</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditNoteModalOpen(true)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                        {note || "No special events or notes for today."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
             <ScrollArea className="h-full pr-6 -mr-6">
                {/* Room Status Section */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Room Status</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Booked Rooms ({bookedRooms.length})</h4>
                            {bookedRooms.length > 0 ? bookedRooms.map(room => (
                                <div key={room.number} className="p-3 border rounded-lg bg-muted/50 mb-2 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-primary">Room {room.number}</p>
                                        <p className="text-sm text-muted-foreground">{room.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium flex items-center gap-2"><User className="w-4 h-4"/>{room.guest}</p>
                                        {room.checkIn && room.checkOut &&
                                            <p className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4"/>{format(parseISO(room.checkIn), 'MMM d')} - {format(parseISO(room.checkOut), 'MMM d')}</p>
                                        }
                                    </div>
                                </div>
                            )) : <p className="text-center text-muted-foreground py-4 text-sm rounded-lg border">No rooms booked for this date.</p>}
                        </div>
                        <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Available Rooms ({availableRooms.length})</h4>
                            {availableRooms.length > 0 ? availableRooms.map(room => (
                                <div key={room.number} className="p-3 border rounded-lg flex justify-between items-center mb-2">
                                    <div>
                                        <p className="font-bold text-green-600">Room {room.number}</p>
                                        <p className="text-sm text-muted-foreground">{room.type}</p>
                                    </div>
                                    <Button size="sm" onClick={() => onOccupy(room.number)}>Book Now</Button>
                                </div>
                            )) : <p className="text-center text-muted-foreground py-4 text-sm rounded-lg border">No rooms available for this date.</p>}
                        </div>
                    </div>
                </div>
            </ScrollArea>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
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
