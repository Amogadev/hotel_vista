
'use client';

import React, { useState, useMemo, useContext, useTransition } from 'react';
import { DataContext, type Guest } from '@/context/data-provider';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Phone,
  Mail,
  Home,
  BookOpen
} from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddGuestModal, GuestFormValues as AddGuestFormValues } from './add-guest-modal';
import { EditGuestModal, GuestFormValues as EditGuestFormValues } from './edit-guest-modal';
import { useToast } from '@/hooks/use-toast';
import { deleteGuest } from '@/app/actions';

function GuestCard({ guest, onEdit, onDelete }: { guest: Guest, onEdit: (guest: Guest) => void, onDelete: (guest: Guest) => void }) {
    return (
        <Card>
            <CardContent className="p-4 flex gap-4 items-start">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${guest.id}`} alt={guest.name} />
                    <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg">{guest.name}</p>
                            <p className="text-sm text-muted-foreground">{guest.idProof}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(guest)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Generating invoice for ${guest.name}...`)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Generate Invoice</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(guest)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1 pt-1">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{guest.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{guest.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            <span>{guest.address}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardContent>
                <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">Booking History:</p>
                </div>
                <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 mt-1">
                    {guest.bookingHistory.map((booking, index) => (
                        <li key={index}>{booking}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default function GuestManagementDashboard() {
  const { toast } = useToast();
  const { guests, setGuests } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleGuestAdded = (newGuestData: AddGuestFormValues) => {
    const newGuest: Guest = {
      ...newGuestData,
      id: `guest-${Date.now()}`, // Temporary ID
    };
    setGuests(prevGuests => [newGuest, ...prevGuests].sort((a,b) => a.name.localeCompare(b.name)));
    handleCloseAddModal();
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setEditingGuest(null);
    setIsEditModalOpen(false);
  };

  const handleGuestUpdated = (updatedGuestData: EditGuestFormValues & { id: string }) => {
    setGuests(prevGuests =>
      prevGuests.map(g => (g.id === updatedGuestData.id ? updatedGuestData : g)).sort((a,b) => a.name.localeCompare(b.name))
    );
    handleCloseEditModal();
  };

  const handleDeleteGuest = (guest: Guest) => {
    setDeletingGuest(guest);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingGuest) return;

    startTransition(async () => {
        try {
            const result = await deleteGuest(deletingGuest.id);
            if (result.success) {
                toast({
                    title: "Guest Deleted",
                    description: `${deletingGuest.name} has been successfully deleted.`,
                });
                setGuests(prevGuests => prevGuests.filter(g => g.id !== deletingGuest.id));
            } else {
                throw new Error(result.error || "Failed to delete guest");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: (error as Error).message,
            });
        } finally {
            setIsDeleteAlertOpen(false);
            setDeletingGuest(null);
        }
    });
  };

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, guests]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-muted-foreground">
            View and manage all guest information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </header>
      
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {filteredGuests.map((guest) => (
            <GuestCard key={guest.id} guest={guest} onEdit={handleEditGuest} onDelete={handleDeleteGuest} />
        ))}
      </div>

       <AddGuestModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onGuestAdded={handleGuestAdded}
      />
      {editingGuest && (
        <EditGuestModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onGuestUpdated={handleGuestUpdated}
            guest={editingGuest}
        />
      )}
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this guest?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {deletingGuest?.name}'s record.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingGuest(null)}>Cancel</AlertDialogCancel>
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
