
'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  Bed,
  Users,
  CalendarDays,
  DollarSign,
  Plus,
  Eye,
  Settings,
  ArrowLeft,
  Trash2,
  Loader2,
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
import { AddRoomModal, RoomFormValues } from './add-room-modal';
import { EditRoomModal, EditRoomFormValues } from './edit-room-modal';
import { RoomDetailsModal } from './room-details-modal';
import { format } from 'date-fns';
import { deleteRoom } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


type Room = {
    number: string;
    type: string;
    status: string;
    guest?: string;
    checkIn?: string;
    checkOut?: string;
    rate: string;
};

const initialRooms: Room[] = [
  {
    number: '101',
    type: 'Standard Single',
    status: 'Occupied',
    guest: 'John Smith',
    checkIn: '2024-01-10',
    checkOut: '2024-01-12',
    rate: '$120/night',
  },
  {
    number: '102',
    type: 'Deluxe Double',
    status: 'Available',
    rate: '$180/night',
  },
  {
    number: '103',
    type: 'Suite',
    status: 'Cleaning',
    rate: '$300/night',
  },
  {
    number: '201',
    type: 'Standard Double',
    status: 'Occupied',
    guest: 'Sarah Johnson',
    checkIn: '2024-01-09',
    checkOut: '2024-01-11',
    rate: '$150/night',
  },
  {
    number: '202',
    type: 'Deluxe Single',
    status: 'Maintenance',
    rate: '$140/night',
  },
  {
    number: '203',
    type: 'Suite',
    status: 'Available',
    rate: '$320/night',
  },
];

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

function RoomCard({ room, onViewRoom, onEditRoom, onDeleteRoom }: { room: Room, onViewRoom: (room: Room) => void, onEditRoom: (room: Room) => void, onDeleteRoom: (room: Room) => void }) {
  const variant = statusVariantMap[room.status] || 'default';
  const colorClass = statusColorMap[room.status] || '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold">Room {room.number}</CardTitle>
          <Badge variant={variant} className={`capitalize ${colorClass}`}>{room.status}</Badge>
        </div>
        <CardDescription>{room.type}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {room.guest && (
          <div>
            <p className="text-sm font-medium">Guest: {room.guest}</p>
            <p className="text-sm text-muted-foreground">
              Check-in: {room.checkIn} | Check-out: {room.checkOut}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{room.rate}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewRoom(room)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditRoom(room)}>
              <Settings className="h-4 w-4" />
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteRoom(room)}>
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoomManagementDashboard() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter(room => room.status === 'Occupied').length;
    const available = rooms.filter(room => room.status === 'Available').length;
    const revenue = rooms
        .filter(room => room.status === 'Occupied')
        .reduce((acc, room) => acc + parseFloat(room.rate.replace(/[^0-9.-]+/g, "")), 0);

    return [
      {
        title: 'Total Rooms',
        value: totalRooms.toString(),
        icon: <Bed className="h-6 w-6 text-blue-500" />,
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
        title: 'Revenue Today',
        value: `$${revenue.toLocaleString()}`,
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
      rate: `$${newRoomData.price}/night`,
      guest: newRoomData.guest,
      checkIn: newRoomData.checkIn ? format(newRoomData.checkIn, 'yyyy-MM-dd') : undefined,
      checkOut: newRoomData.checkOut ? format(newRoomData.checkOut, 'yyyy-MM-dd') : undefined,
    };
    setRooms(prevRooms => [...prevRooms, newRoom]);
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
      rate: `$${updatedRoomData.price}/night`,
      guest: updatedRoomData.guest,
      checkIn: updatedRoomData.checkIn ? format(new Date(updatedRoomData.checkIn), 'yyyy-MM-dd') : undefined,
      checkOut: updatedRoomData.checkOut ? format(new Date(updatedRoomData.checkOut), 'yyyy-MM-dd') : undefined,
    };
    setRooms(prevRooms =>
      prevRooms.map(r => (r.number === updatedRoomData.originalNumber ? updatedRoom : r))
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
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all hotel rooms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleOpenAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <RoomCard key={`${room.number}-${index}`} room={room} onViewRoom={handleViewRoom} onEditRoom={handleEditRoom} onDeleteRoom={handleDeleteRoom} />
        ))}
      </div>
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
  );
}
