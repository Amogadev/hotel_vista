
'use client';

import React, { useState, useMemo, useContext, useTransition } from 'react';
import { DataContext, Hall } from '@/context/data-provider';
import {
  Building,
  Users,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  X,
  Bed,
  CalendarDays,
  BedDouble,
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
import { Input } from '@/components/ui/input';
import { AddHallModal, HallFormValues } from './add-hall-modal';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { QuickActionsDropdown } from './hall-quick-actions-dropdown';
import { HallDetailsModal } from './hall-details-modal';
import { EditHallModal } from './edit-hall-modal';
import { useToast } from '@/hooks/use-toast';
import { deleteHall, updateHall } from '@/app/actions';
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
import { useRouter } from 'next/navigation';

const statusColorMap: { [key: string]: string } = {
  Booked: 'bg-red-100 text-red-800 border-red-200',
  Available: 'bg-green-100 text-green-800 border-green-200',
  Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  BOOKED: 'bg-red-100 text-red-800 border-red-200',
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
};

function HallCard({ hall, onViewHall, onEditHall, onDeleteHall, onAction, availability }: { hall: Hall, onViewHall: (hall: Hall) => void, onEditHall: (hall: Hall) => void, onDeleteHall: (hall: Hall) => void, onAction: (action: 'book' | 'maintenance', hall: Hall) => void, availability?: { status: 'BOOKED' | 'AVAILABLE', customerName?: string } }) {
  
  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onAction('book', hall);
  };
  
  const displayStatus = availability ? availability.status : hall.status;
  const colorClass = statusColorMap[displayStatus] || '';
  const customerName = availability ? availability.customerName : hall.customerName;

  return (
    <Card className="relative flex flex-col transition-all duration-200 hover:shadow-lg w-40 h-40 rounded-lg">
       {!availability && (
        <div className="absolute top-1 right-1 z-10">
          <QuickActionsDropdown hall={hall} onEdit={onEditHall} onDelete={onDeleteHall} onAction={onAction} />
        </div>
       )}
      <CardContent 
        className={cn(
            "flex-grow flex flex-col items-center justify-center p-2 text-center cursor-pointer rounded-lg",
            colorClass
        )}
        onClick={() => onViewHall(hall)}
      >
        <p className="text-xl font-bold">{hall.name}</p>
        <Badge variant={'default'} className={cn("mt-2 capitalize", colorClass, !colorClass.includes('text-') && 'text-foreground')}>
            {displayStatus.toLowerCase()}
        </Badge>
        
        {customerName ? (
            <div className="mt-3 text-xs text-center space-y-1">
                <p className="font-semibold truncate flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    {customerName}
                </p>
            </div>
        ) : (
            displayStatus === 'Available' && !availability && (
                <Button variant="outline" size="sm" className="mt-3 h-7 text-xs border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={handleBookClick}>
                    Book
                </Button>
            )
        )}
      </CardContent>
    </Card>
  );
}

export default function HallManagementDashboard() {
  const { halls, setHalls } = useContext(DataContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingHall, setViewingHall] = useState<Hall | null>(null);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [deletingHall, setDeletingHall] = useState<Hall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleHallAdded = (newHallData: HallFormValues) => {
    const newHall: Hall = {
      ...newHallData,
      id: `hall-${Date.now()}`,
    };
    setHalls(prevHalls => [...prevHalls, newHall].sort((a, b) => a.name.localeCompare(b.name)));
    handleCloseAddModal();
  };

  const handleHallUpdated = (updatedHallData: any) => {
    const updatedHall: Hall = {
        ...updatedHallData,
        checkIn: updatedHallData.checkIn ? format(new Date(updatedHallData.checkIn), 'yyyy-MM-dd') : undefined,
        checkOut: updatedHallData.checkOut ? format(new Date(updatedHallData.checkOut), 'yyyy-MM-dd') : undefined,
    };
    setHalls(prevHalls =>
      prevHalls.map(h => (h.id === updatedHall.id ? updatedHall : h)).sort((a,b) => a.name.localeCompare(b.name))
    );
    handleCloseEditModal();
  };
  
  const hallAvailabilities = useMemo(() => {
    if (!selectedDate) return null;

    const availabilities = new Map<string, { status: 'BOOKED' | 'AVAILABLE', customerName?: string }>();
    
    halls.forEach(hall => {
        let isBooked = false;
        let customerName: string | undefined = undefined;

        if (hall.checkIn && hall.checkOut) {
            const checkInDate = startOfDay(parseISO(hall.checkIn));
            const checkOutDate = endOfDay(parseISO(hall.checkOut));
            if (isWithinInterval(selectedDate, { start: checkInDate, end: checkOutDate })) {
                isBooked = true;
                customerName = hall.customerName;
            }
        }
        
        availabilities.set(hall.id, {
            status: isBooked ? 'BOOKED' : 'AVAILABLE',
            customerName,
        });
    });

    return availabilities;
  }, [halls, selectedDate]);

  const filteredHalls = useMemo(() => {
    if (hallAvailabilities) {
        return halls;
    }
    return halls.filter(hall =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [halls, searchTerm, hallAvailabilities]);

  const stats = useMemo(() => {
    const date = selectedDate || new Date();
    const totalHalls = halls.length;
    
    let bookedCount = 0;
    let availableCount = 0;

    if (hallAvailabilities) { // Date is selected
        halls.forEach(hall => {
            const availability = hallAvailabilities.get(hall.id);
            if (availability) {
                if (availability.status === 'BOOKED') {
                    bookedCount++;
                } else {
                    availableCount++;
                }
            }
        });
    } else { // No date selected, show current status
        halls.forEach(hall => {
            if (hall.status === 'Booked') {
                bookedCount++;
            } else if (hall.status === 'Available') {
                availableCount++;
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
        title: 'Total Halls',
        value: totalHalls.toString(),
        icon: <Building className="h-6 w-6 text-blue-500" />,
      },
      {
        title: 'Booked',
        value: bookedCount.toString(),
        icon: <Bed className="h-6 w-6 text-red-500" />,
      },
      {
        title: 'Available',
        value: availableCount.toString(),
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      },
    ];
  }, [halls, selectedDate, hallAvailabilities]);

  const handleViewHall = (hall: Hall) => {
    setViewingHall(hall);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => setIsViewModalOpen(false);

  const handleEditHall = (hall: Hall) => {
    setEditingHall(hall);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingHall(null);
  };

  const handleDeleteHall = (hall: Hall) => {
    setDeletingHall(hall);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingHall) return;
    startTransition(async () => {
        try {
            const result = await deleteHall(deletingHall.name);
            if (result.success) {
                toast({
                    title: "Hall Deleted",
                    description: `Hall ${deletingHall.name} has been successfully deleted.`,
                });
                setHalls(prevHalls => prevHalls.filter(h => h.name !== deletingHall.name));
            } else {
                throw new Error("Failed to delete hall");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the hall. Please try again.",
            });
        } finally {
            setIsDeleteAlertOpen(false);
            setDeletingHall(null);
        }
    });
  };

  const handleAction = (action: 'book' | 'maintenance' | 'cancel', hall: Hall) => {
    if (action === 'book') {
        router.push(`/book-hall/${hall.name}`);
        return;
    }

    startTransition(async () => {
        let updatedHallData;
        if(action === 'cancel') {
            updatedHallData = {
                ...hall,
                status: 'Available',
                customerName: undefined,
                contact: undefined,
                purpose: undefined,
                checkIn: undefined,
                checkOut: undefined,
                totalPrice: undefined,
            }
        } else {
            updatedHallData = {
                ...hall,
                status: action === 'maintenance' ? 'Maintenance' : 'Available',
            };
        }

        try {
            // @ts-ignore
            const result = await updateHall({ originalName: hall.name, ...updatedHallData });
            if (result.success) {
                toast({
                    title: `Hall Status Updated`,
                    description: `Hall ${hall.name} is now ${updatedHallData.status}.`,
                });
                setHalls(prevHalls =>
                    prevHalls.map(h => (h.id === hall.id ? updatedHallData : h))
                );
            } else {
                throw new Error(result.error || 'Failed to update hall status');
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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hall Management</h1>
          <p className="text-muted-foreground">Monitor and manage all event halls.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hall
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
                <div className={cn("font-bold", stat.title === 'Date' ? 'text-base' : 'text-xl')}>{stat.value}</div>
                </CardContent>
            </Card>
            ))}
        </div>
      </div>

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
                <div className="relative flex-1 w-full md:grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by hall name..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            )}
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredHalls.map((hall, index) => (
                <HallCard 
                    key={`${hall.id}-${index}`} 
                    hall={hall} 
                    onViewHall={handleViewHall} 
                    onEditHall={handleEditHall} 
                    onDeleteHall={handleDeleteHall} 
                    onAction={handleAction}
                    availability={hallAvailabilities?.get(hall.id)}
                />
            ))}
        </div>
      </div>

      <AddHallModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onHallAdded={handleHallAdded}
      />
      {viewingHall && (
          <HallDetailsModal
            hall={viewingHall}
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
          />
      )}
      {editingHall && (
          <EditHallModal
            hall={editingHall}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onHallUpdated={handleHallUpdated}
          />
      )}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this hall?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete Hall {deletingHall?.name}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingHall(null)}>Cancel</AlertDialogCancel>
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
