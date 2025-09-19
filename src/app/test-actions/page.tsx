
'use client';

import { useState, useEffect, useTransition } from 'react';
import { addRoom, getRooms, updateRoom, deleteRoom } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the Room type to match the server action
type Room = {
    id?: string;
    number: string;
    type: string;
    price: number;
    status: string;
    guest?: string;
};

export default function TestActionsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [updateNumber, setUpdateNumber] = useState('');
    const [updateGuest, setUpdateGuest] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchRooms = async () => {
        setIsLoading(true);
        const result = await getRooms();
        if (result.success && result.rooms) {
            setRooms(result.rooms);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch rooms.' });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = () => {
        if (!newRoomNumber) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a room number.' });
            return;
        }
        startTransition(async () => {
            const result = await addRoom({ number: newRoomNumber, type: 'Standard', price: 100, status: 'Available' });
            if (result.success) {
                toast({ title: 'Success', description: 'Room added successfully.' });
                setNewRoomNumber('');
                fetchRooms();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    const handleUpdateRoom = (roomNumber: string) => {
        const roomToUpdate = rooms.find(r => r.number === roomNumber);
        if (!roomToUpdate) return;
        
        startTransition(async () => {
            const result = await updateRoom({
                originalNumber: roomToUpdate.number,
                number: roomToUpdate.number,
                type: roomToUpdate.type,
                price: roomToUpdate.price,
                status: updateGuest ? 'Occupied' : 'Available',
                guest: updateGuest,
            });
            if (result.success) {
                toast({ title: 'Success', description: `Room ${roomNumber} updated.` });
                setUpdateNumber('');
                setUpdateGuest('');
                fetchRooms();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    const handleDeleteRoom = (roomNumber: string) => {
        startTransition(async () => {
            if (confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
                const result = await deleteRoom(roomNumber);
                if (result.success) {
                    toast({ title: 'Success', description: `Room ${roomNumber} deleted.` });
                    fetchRooms();
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: result.error });
                }
            }
        });
    };

    return (
        <div className="p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Test Room Management Actions</CardTitle>
                    <CardDescription>Use this page to test the backend functions for rooms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Add Room */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">1. Add a New Room</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Room Number (e.g., 101)"
                                value={newRoomNumber}
                                onChange={(e) => setNewRoomNumber(e.target.value)}
                            />
                            <Button onClick={handleAddRoom} disabled={isPending}>
                                {isPending && !updateNumber && !updateGuest && <Loader2 className="animate-spin" />} Add Room
                            </Button>
                        </div>
                    </div>

                    {/* Display Rooms */}
                    <div className="space-y-2">
                         <h3 className="font-semibold">2. All Rooms</h3>
                        <Button onClick={fetchRooms} variant="outline" size="sm">Refresh List</Button>
                        {isLoading ? (
                           <div className="flex justify-center items-center h-24">
                             <Loader2 className="animate-spin text-primary" />
                           </div>
                        ) : (
                            <div className="border rounded-lg p-4 space-y-2 h-64 overflow-y-auto">
                                {rooms.length > 0 ? rooms.map(room => (
                                    <div key={room.id} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                                        <div>
                                            <p><strong>Room:</strong> {room.number} | <strong>Status:</strong> {room.status} | <strong>Guest:</strong> {room.guest || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                placeholder="New Guest Name"
                                                className="h-8 w-36"
                                                onChange={(e) => {
                                                    setUpdateNumber(room.number);
                                                    setUpdateGuest(e.target.value);
                                                }}
                                            />
                                            <Button size="sm" onClick={() => handleUpdateRoom(room.number)} disabled={isPending}>Update</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteRoom(room.number)} disabled={isPending}>Delete</Button>
                                        </div>
                                    </div>
                                )) : <p>No rooms found. Add one above.</p>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
