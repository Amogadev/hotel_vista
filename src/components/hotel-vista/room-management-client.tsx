

'use client';

import React, { useState, useTransition, useMemo, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataContext } from '@/context/data-provider';
import {
  Bed,
  Users,
  DollarSign,
  Plus,
  Eye,
  Settings,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  BarChart2,
  Search,
  BedDouble,
  CalendarDays,
  User,
  Pencil,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { AddRoomModal, RoomFormValues } from './add-room-modal';
import { EditRoomModal, EditRoomFormValues } from './edit-room-modal';
import { RoomDetailsModal } from './room-details-modal';
import { QuickActionsDropdown } from './quick-actions-dropdown';
import { RoomCalendarView } from './room-calendar-view';
import { DailyBookingModal } from './daily-booking-modal';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


import { format, differenceInCalendarDays, parseISO, isWithinInterval, startOfDay, endOfDay, isSameDay, isFuture } from 'date-fns';
import { deleteRoom, updateRoom } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Room } from '@/context/data-provider';
import { cn } from '@/lib/utils';
import { RoomManagementSidebar } from './room-management-sidebar';


const statusFilters = ['All', 'Available', 'Occupied', 'Booked', 'Cleaning', 'Maintenance'];

const statusColorMap: { [key: string]: string } = {
  Occupied: 'bg-green-100 text-gray-700 border-green-200',
  Available: 'bg-blue-100 text-gray-700 border-blue-200',
  Cleaning: 'bg-yellow-100 text-gray-700 border-yellow-200',
  Maintenance: 'bg-red-100 text-gray-700 border-red-200',
  Booked: 'bg-red-100 text-gray-700 border-red-200',
  BOOKED: 'bg-red-100 text-gray-700 border-red-200',
  AVAILABLE: 'bg-blue-100 text-gray-700 border-blue-200',
};

function RoomCard({ room, onViewRoom, onEditRoom, onDeleteRoom, onAction, availability }: { room: Room, onViewRoom: (room: Room) => void, onEditRoom: (room: Room) => void, onDeleteRoom: (room: Room) => void, onAction: (action: 'checkout' | 'maintenance' | 'occupy', room: Room) => void, availability?: { status: 'BOOKED' | 'AVAILABLE', guestName?: string } }) {
  
  const handleOccupyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onAction('occupy', room);
  };
  
  const displayStatus = availability ? availability.status : (room.status === 'Occupied' && room.checkIn && isFuture(startOfDay(parseISO(room.checkIn))) ? 'Booked' : room.status);
  const colorClass = statusColorMap[displayStatus] || '';
  const guestName = availability ? availability.guestName : room.guest;

  return (
    <Card className="relative flex flex-col transition-all duration-200 hover:shadow-lg w-40 h-40 rounded-lg">
       {!availability && (
        <div className="absolute top-1 right-1 z-10">
          <QuickActionsDropdown room={room} onEdit={onEditRoom} onDelete={onDeleteRoom} onAction={onAction} />
        </div>
       )}
      <CardContent 
        className={cn(
            "flex-grow flex flex-col items-center justify-center p-2 text-center cursor-pointer rounded-lg",
            colorClass
        )}
        onClick={() => onViewRoom(room)}
      >
        <p className="text-3xl font-bold">{room.number}</p>
        <Badge variant={'default'} className={cn("mt-2 capitalize", colorClass, !colorClass.includes('text-') && 'text-foreground')}>
            {displayStatus}
        </Badge>
        
        {guestName ? (
            <div className="mt-3 text-xs text-center space-y-1">
                <p className="font-semibold truncate flex items-center justify-center gap-1">
                    <User className="h-3 w-3" />
                    {guestName}
                </p>
            </div>
        ) : (
            displayStatus === 'Available' && !availability && (
                <Button variant="outline" size="sm" className="mt-3 h-7 text-xs border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={handleOccupyClick}>
                    Occupy
                </Button>
            )
        )}
      </CardContent>
    </Card>
  );
}

export default function RoomManagementDashboard() {
  const { rooms, setRooms } = useContext(DataContext);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDailyBookingModalOpen, setIsDailyBookingModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeView, setActiveView] = useState('all-rooms');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const router = useRouter();

  const handleQuickAction = (action: 'checkout' | 'maintenance' | 'occupy', room: Room) => {
    if (action === 'occupy') {
      router.push(`/occupy/${room.number}`);
      return;
    }
    
    startTransition(async () => {
        let updatedRoomData: Room & { originalNumber: string };
        let newStatus: string;

        if (action === 'checkout') {
            newStatus = 'Cleaning';
            updatedRoomData = { 
                ...room, 
                originalNumber: room.number, 
                status: newStatus, 
                guest: undefined, 
                checkIn: undefined, 
                checkOut: undefined, 
                totalPrice: undefined,
                peopleCount: undefined,
                idProof: undefined,
                email: undefined,
                advanceAmount: undefined,
                paidAmount: undefined
            };
        } else { 
            newStatus = 'Maintenance';
            updatedRoomData = { 
                ...room, 
                originalNumber: room.number, 
                status: newStatus
            };
        }
        try {
            const result = await updateRoom(updatedRoomData);

            if (result.success) {
                toast({
                    title: `Room Status Updated`,
                    description: `Room ${room.number} is now ${newStatus}.`,
                });
                
                const finalUpdatedRoom = { ...room, ...result.room };
                setRooms(prevRooms =>
                    prevRooms.map(r => (r.number === room.number ? finalUpdatedRoom : r))
                );
            } else {
                 throw new Error(result.error || `Failed to update room status.`);
            }
        } catch(error: any) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || `Failed to update room status.`,
            });
        }
    });
};

const roomAvailabilities = useMemo(() => {
    if (!selectedDate) return null;

    const availabilities = new Map<string, { status: 'BOOKED' | 'AVAILABLE', guestName?: string }>();
    
    rooms.forEach(room => {
        let isBooked = false;
        let guestName: string | undefined = undefined;

        if (room.checkIn && room.checkOut) {
            const checkInDate = startOfDay(parseISO(room.checkIn));
            const checkOutDate = endOfDay(parseISO(room.checkOut));
            if (isWithinInterval(selectedDate, { start: checkInDate, end: checkOutDate })) {
                isBooked = true;
                guestName = room.guest;
            }
        }
        
        availabilities.set(room.number, {
            status: isBooked ? 'BOOKED' : 'AVAILABLE',
            guestName,
        });
    });

    return availabilities;
  }, [rooms, selectedDate]);


  const filteredRooms = useMemo(() => {
    let roomsToDisplay = [...rooms];

    if (roomAvailabilities) {
        // If a date is selected, we don't need other filters
        return roomsToDisplay;
    }

    if (activeFilter !== 'All') {
        if (activeFilter === 'Booked') {
            roomsToDisplay = roomsToDisplay.filter(room => room.status === 'Occupied' && room.checkIn && isFuture(startOfDay(parseISO(room.checkIn))));
        } else if (activeFilter === 'Occupied') {
            roomsToDisplay = roomsToDisplay.filter(room => room.status === 'Occupied' && (!room.checkIn || !isFuture(startOfDay(parseISO(room.checkIn)))));
        } else {
            roomsToDisplay = roomsToDisplay.filter(room => room.status === activeFilter);
        }
    }
    
    if (searchTerm) {
        roomsToDisplay = roomsToDisplay.filter(room => 
            room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.guest && room.guest.toLowerCase().includes(searchTerm.toLowerCase())) ||
            room.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return roomsToDisplay;
}, [rooms, searchTerm, activeFilter, roomAvailabilities]);


const stats = useMemo(() => {
    const today = new Date();
    const date = selectedDate || today;
    const totalRooms = rooms.length;
    
    let occupiedCount = 0;
    let availableCount = 0;
    let bookedCount = 0;

    if (roomAvailabilities) { // Date is selected
        rooms.forEach(room => {
            const availability = roomAvailabilities.get(room.number);
            if (availability) {
                if (availability.status === 'BOOKED') {
                    bookedCount++;
                } else {
                    availableCount++;
                }
            }
        });
        occupiedCount = bookedCount; // On a specific date, "booked" is the same as "occupied" for that day
    } else { // No date selected, show current status
        availableCount = rooms.filter(r => r.status === 'Available').length;
        rooms.forEach(room => {
            if (room.status === 'Occupied') {
                if (room.checkIn && isFuture(startOfDay(parseISO(room.checkIn)))) {
                    bookedCount++;
                } else {
                    occupiedCount++;
                }
            }
        });
    }

    return [
      {
        title: 'Date',
        value: format(date, 'PPP'),
        icon: <CalendarIcon className="h-6 w-6 text-orange-300" />,
      },
      {
        title: 'Total Rooms',
        value: totalRooms.toString(),
        icon: <BedDouble className="h-6 w-6 text-blue-500" />,
      },
      {
        title: 'Booked',
        value: bookedCount.toString(),
        icon: <Bed className="h-6 w-6 text-red-500" />,
      },
      {
        title: 'Occupied',
        value: occupiedCount.toString(),
        icon: <Users className="h-6 w-6 text-green-500" />,
      },
      {
        title: 'Available',
        value: availableCount.toString(),
        icon: <CalendarDays className="h-6 w-6 text-blue-500" />,
      },
    ];
  }, [rooms, selectedDate, roomAvailabilities]);


  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleRoomAdded = async (newRoomData: RoomFormValues) => {
    try {
        const result = await addRoom(newRoomData);
        if (result.success && result.room) {
            const newRoom: Room = {
                ...result.room,
                number: result.room.number,
                type: result.room.type,
                price: result.room.price,
                status: result.room.status,
            };
            setRooms(prevRooms => [...prevRooms, newRoom].sort((a,b) => a.number.localeCompare(b.number)));
            handleCloseAddModal();
            toast({
                title: 'Room Added',
                description: `Room ${newRoom.number} has been successfully added.`,
            });
        } else {
            throw new Error(result.error || 'Failed to add room.');
        }
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to add room. Please try again.',
        });
    }
  };

  const handleViewRoom = (room: Room) => {
    setViewingRoom(room);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingRoom(null);
  };
  
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRoom(null);
  };

  const handleRoomUpdated = async (updatedRoomData: EditRoomFormValues & { originalNumber: string }) => {
    try {
        const result = await updateRoom(updatedRoomData);
         if (result.success && result.room) {
            setRooms(prevRooms =>
                prevRooms.map(r => (r.number === updatedRoomData.originalNumber ? {...r, ...result.room} : r)).sort((a,b) => a.number.localeCompare(b.number))
            );
            handleCloseEditModal();
             toast({
                title: 'Room Updated',
                description: `Room ${result.room.number} has been successfully updated.`,
            });
        } else {
           throw new Error(result.error || 'Failed to update room.');
        }
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to update room. Please try again.',
        });
    }
  };

  const handlePaymentUpdated = (roomNumber: string, newPaidAmount: number) => {
    setRooms(prevRooms => prevRooms.map(r => 
        r.number === roomNumber ? { ...r, paidAmount: newPaidAmount } : r
    ));
    if(viewingRoom?.number === roomNumber) {
        setViewingRoom(prev => prev ? { ...prev, paidAmount: newPaidAmount } : null);
    }
  };

  const handleDeleteRoom = (room: Room) => {
    setDeletingRoom(room);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingRoom) return;
    startTransition(async () => {
        try {
            const result = await deleteRoom(deletingRoom.number);
            if (result.success) {
                toast({
                    title: "Room Deleted",
                    description: `Room ${deletingRoom.number} has been successfully deleted.`,
                });
                setRooms(prevRooms => prevRooms.filter(r => r.number !== deletingRoom.number));
            } else {
                throw new Error(result.error || 'Failed to delete room.')
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to delete room.'
            })
        }
        
        setIsDeleteAlertOpen(false);
        setDeletingRoom(null);
    });
  };

  const handleOccupyClick = (roomNumber: string) => {
    router.push(`/occupy/${roomNumber}`);
    if (isDailyBookingModalOpen) {
        setIsDailyBookingModalOpen(false);
    }
  };


  return (
    <div className="flex h-full">
      <RoomManagementSidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all hotel rooms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDailyBookingModalOpen(true)}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button onClick={handleOpenAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </header>
        {activeView === 'all-rooms' && (
          <div className="flex justify-center">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {stats.map((stat) => (
                  <Card key={stat.title} className="w-full md:w-56">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                      <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                      {stat.icon}
                      </CardHeader>
                      <CardContent className="pb-4">
                      <div className={cn("font-bold", stat.title === 'Date' ? 'text-base' : 'text-xl')}>{stat.value}</div>
                      </CardContent>
                  </Card>
                  ))}
              </div>
          </div>
        )}

        {activeView === 'all-rooms' && (
          <>
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                'w-full justify-start text-left font-normal md:w-[240px]',
                                !selectedDate && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(day) => {
                                    if (day) {
                                        setSelectedDate(day);
                                    }
                                    setIsDatePickerOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        {selectedDate && (
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)} >
                               <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {!selectedDate && (
                        <>
                        <div className="relative flex-1 w-full md:grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Room #, Guest, or Status..."
                                className="pl-10 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {statusFilters.map(filter => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? 'default' : 'outline'}
                                    onClick={() => setActiveFilter(filter)}
                                    className="text-xs h-8"
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredRooms.map((room, index) => (
                        <RoomCard 
                            key={`${room.number}-${index}`} 
                            room={room} 
                            onViewRoom={handleViewRoom} 
                            onEditRoom={handleEditRoom} 
                            onDeleteRoom={handleDeleteRoom} 
                            onAction={handleQuickAction}
                            availability={roomAvailabilities?.get(room.number)}
                        />
                    ))}
                </div>
            </div>
          </>
        )}
        {activeView === 'calendar' && <RoomCalendarView rooms={rooms} />}

        <AddRoomModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onRoomAdded={handleRoomAdded as any}
        />
        {viewingRoom && (
          <RoomDetailsModal
            room={viewingRoom}
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            onPaymentUpdated={handlePaymentUpdated}
          />
        )}
        {editingRoom && (
          <EditRoomModal
            room={editingRoom}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onRoomUpdated={handleRoomUpdated}
          />
        )}
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this room?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete Room {deletingRoom?.number}.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeletingRoom(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
         {isDailyBookingModalOpen && (
            <DailyBookingModal
                date={new Date()}
                rooms={rooms}
                isOpen={isDailyBookingModalOpen}
                onClose={() => setIsDailyBookingModalOpen(false)}
                onOccupy={handleOccupyClick}
            />
        )}
      </div>
    </div>
  );
}
