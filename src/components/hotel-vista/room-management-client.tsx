
'use client';

import React, { useState, useTransition, useMemo, useContext } from 'react';
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
  Calendar,
  BarChart2,
  Search,
  BedDouble,
  CalendarDays,
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
import { RoomRevenueView } from './room-revenue-view';

import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { deleteRoom, updateRoom } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Room } from '@/context/data-provider';
import { cn } from '@/lib/utils';
import { RoomManagementSidebar } from './room-management-sidebar';


const statusFilters = ['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'];

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Occupied: 'destructive',
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

function RoomCard({ room, onViewRoom, onEditRoom, onDeleteRoom, onAction }: { room: Room, onViewRoom: (room: Room) => void, onEditRoom: (room: Room) => void, onDeleteRoom: (room: Room) => void, onAction: (action: 'checkout' | 'maintenance' | 'occupy', room: Room) => void }) {
  const isAvailable = room.status === 'Available';

  const handleOccupyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onAction('occupy', room);
  };

  return (
    <Card className="relative flex flex-col transition-all duration-200 hover:shadow-lg w-40 h-40 rounded-lg">
      <div className="absolute top-1 right-1 z-10">
        <QuickActionsDropdown room={room} onEdit={onEditRoom} onDelete={onDeleteRoom} onAction={onAction} />
      </div>
      <CardContent 
        className={cn(
            "flex-grow flex flex-col items-center justify-center p-2 text-center cursor-pointer rounded-lg",
            isAvailable && "bg-gray-100 dark:bg-gray-800"
        )}
        onClick={() => onViewRoom(room)}
      >
        <p className={cn("text-3xl font-bold", isAvailable ? "text-gray-700" : "text-primary")}>{room.number}</p>
        <Badge variant={'default'} className={cn("mt-2 capitalize", statusColorMap[room.status] || '')}>
            {room.status}
        </Badge>
        
        {isAvailable ? (
            <Button variant="secondary" size="sm" className="mt-3 h-7 text-xs bg-blue-500 text-white hover:bg-blue-600" onClick={handleOccupyClick}>
                Occupy
            </Button>
        ) : (
          room.guest && (
            <div className="mt-3 text-xs text-center">
                <p className="font-semibold truncate">{room.guest}</p>
                {room.checkIn && room.checkOut && (
                    <p className="text-muted-foreground">{format(parseISO(room.checkIn), 'MMM d')} - {format(parseISO(room.checkOut), 'MMM d')}</p>
                )}
            </div>
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
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeView, setActiveView] = useState('all-rooms');


  const handleQuickAction = (action: 'checkout' | 'maintenance' | 'occupy', room: Room) => {
    if (action === 'occupy') {
      handleEditRoom(room);
      return;
    }
    
    startTransition(async () => {
        let updatedRoomData: Partial<Room> & { originalNumber: string; number: string; type: string; price: number, status: string; };

        if (action === 'checkout') {
            updatedRoomData = { 
                ...room, 
                originalNumber: room.number, 
                status: 'Cleaning', 
                guest: undefined, 
                checkIn: undefined, 
                checkOut: undefined, 
                totalPrice: undefined 
            };
        } else { 
            updatedRoomData = { 
                ...room, 
                originalNumber: room.number, 
                status: 'Maintenance' 
            };
        }

        try {
            // @ts-ignore
            const result = await updateRoom(updatedRoomData);
            if (result.success) {
                toast({
                    title: `Room Status Updated`,
                    description: `Room ${room.number} is now ${action === 'checkout' ? 'Cleaning' : 'under Maintenance'}.`,
                });
                
                const finalUpdatedRoom = {
                    ...room,
                    status: updatedRoomData.status,
                    guest: updatedRoomData.guest,
                    checkIn: updatedRoomData.checkIn,
                    checkOut: updatedRoomData.checkOut,
                    totalPrice: updatedRoomData.totalPrice,
                }
                setRooms(prevRooms =>
                    prevRooms.map(r => (r.number === room.number ? finalUpdatedRoom : r))
                );
            } else {
                throw new Error(result.error || 'Failed to update room status');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: (error as Error).message,
            });
        }
    });
};

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
        const matchesFilter = activeFilter === 'All' || room.status === activeFilter;
        const matchesSearch = searchTerm === '' ||
            room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.guest && room.guest.toLowerCase().includes(searchTerm.toLowerCase())) ||
            room.status.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });
  }, [rooms, searchTerm, activeFilter]);


  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter(room => room.status === 'Occupied').length;
    const available = rooms.filter(room => room.status === 'Available').length;
    const revenue = rooms
        .filter(room => room.status === 'Occupied' && room.totalPrice)
        .reduce((acc, room) => acc + room.totalPrice!, 0);

    return [
      {
        title: 'Total Rooms',
        value: totalRooms.toString(),
        icon: <BedDouble className="h-6 w-6 text-blue-500" />,
      },
      {
        title: 'Occupied',
        value: occupied.toString(),
        icon: <Users className="h-6 w-6 text-green-500" />,
      },
      {
        title: 'Available',
        value: available.toString(),
        icon: <CalendarDays className="h-6 w-6 text-blue-500" />,
      },
      {
        title: 'Est. Revenue',
        value: `₹${revenue.toLocaleString()}`,
        icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
      },
    ];
  }, [rooms]);


  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleRoomAdded = (newRoomData: RoomFormValues) => {
    const newRoom: Room = {
      number: newRoomData.number,
      type: newRoomData.type,
      status: newRoomData.status,
      price: newRoomData.price,
      guest: newRoomData.guest,
      checkIn: newRoomData.checkIn ? format(newRoomData.checkIn, 'yyyy-MM-dd') : undefined,
      checkOut: newRoomData.checkOut ? format(newRoomData.checkOut, 'yyyy-MM-dd') : undefined,
      totalPrice: newRoomData.totalPrice,
    };
    setRooms(prevRooms => [...prevRooms, newRoom].sort((a,b) => a.number.localeCompare(b.number)));
    handleCloseAddModal();
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

  const handleRoomUpdated = (updatedRoomData: EditRoomFormValues & { originalNumber: string }) => {
    const updatedRoom: Room = {
      number: updatedRoomData.number,
      type: updatedRoomData.type,
      status: updatedRoomData.status,
      price: updatedRoomData.price,
      guest: updatedRoomData.guest,
      checkIn: updatedRoomData.checkIn ? format(new Date(updatedRoomData.checkIn), 'yyyy-MM-dd') : undefined,
      checkOut: updatedRoomData.checkOut ? format(new Date(updatedRoomData.checkOut), 'yyyy-MM-dd') : undefined,
      totalPrice: updatedRoomData.totalPrice,
    };
    setRooms(prevRooms =>
      prevRooms.map(r => (r.number === updatedRoomData.originalNumber ? updatedRoom : r)).sort((a,b) => a.number.localeCompare(b.number))
    );
    handleCloseEditModal();
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
                throw new Error("Failed to delete room");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the room. Please try again.",
            });
        } finally {
            setIsDeleteAlertOpen(false);
            setDeletingRoom(null);
        }
    });
  };


  return (
    <div className="flex h-full">
      <RoomManagementSidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all hotel rooms
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOpenAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </header>
        <div className="flex justify-center">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                <Card key={stat.title} className="w-full md:w-56">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                    </CardHeader>
                    <CardContent className="pb-4">
                    <div className="text-xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>

        {activeView === 'all-rooms' && (
          <>
            <div className="mt-4">
              <Card>
                  <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
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
                  </CardContent>
              </Card>
            </div>
            <div className="flex justify-center mt-6">
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {filteredRooms.map((room, index) => (
                    <RoomCard key={`${room.number}-${index}`} room={room} onViewRoom={handleViewRoom} onEditRoom={handleEditRoom} onDeleteRoom={handleDeleteRoom} onAction={handleQuickAction} />
                    ))}
                </div>
            </div>
          </>
        )}
        {activeView === 'calendar' && <RoomCalendarView rooms={rooms} />}
        {activeView === 'revenue' && <RoomRevenueView rooms={rooms} />}

        <AddRoomModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onRoomAdded={handleRoomAdded}
        />
        {viewingRoom && (
          <RoomDetailsModal
            room={viewingRoom}
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
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
      </div>
    </div>
  );
