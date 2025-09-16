
'use client';

import React, { useState } from 'react';
import {
  Bed,
  Users,
  CalendarDays,
  DollarSign,
  Plus,
  Eye,
  Settings,
  ArrowLeft,
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
import { SidebarTrigger } from '../ui/sidebar';
import { RoomDetailsModal } from './room-details-modal';
import { AddRoomModal } from './add-room-modal';

type Room = {
    number: string;
    type: string;
    status: string;
    guest?: string;
    checkIn?: string;
    checkOut?: string;
    rate: string;
};

const stats = [
  {
    title: 'Total Rooms',
    value: '120',
    icon: <Bed className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'Occupied',
    value: '85',
    icon: <Users className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Available',
    value: '28',
    icon: <CalendarDays className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'Revenue Today',
    value: '$12,750',
    icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
  },
];

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

function RoomCard({ room, onSelectRoom }: { room: Room, onSelectRoom: (room: Room) => void }) {
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSelectRoom(room)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoomManagementDashboard() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleRoomAdded = (newRoomData: { number: string; type: string; price: number; status: string; }) => {
    const newRoom: Room = {
      number: newRoomData.number,
      type: newRoomData.type,
      status: newRoomData.status,
      rate: `$${newRoomData.price}/night`,
    };
    setRooms(prevRooms => [...prevRooms, newRoom]);
    handleCloseAddModal();
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
        {rooms.map((room) => (
          <RoomCard key={room.number} room={room} onSelectRoom={handleSelectRoom} />
        ))}
      </div>
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
        />
      )}
      <AddRoomModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onRoomAdded={handleRoomAdded}
      />
    </div>
  );
}
