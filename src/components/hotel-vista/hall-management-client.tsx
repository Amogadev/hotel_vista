
'use client';

import React, { useState, useMemo, useContext } from 'react';
import { DataContext, Hall } from '@/context/data-provider';
import {
  Building,
  Users,
  DollarSign,
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

const statusColorMap: { [key: string]: string } = {
  Booked: 'bg-red-100 text-red-800 border-red-200',
  Available: 'bg-green-100 text-green-800 border-green-200',
  Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  BOOKED: 'bg-red-100 text-red-800 border-red-200',
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
};

const statusIconMap: { [key: string]: React.ReactNode } = {
    Booked: <XCircle className="h-4 w-4" />,
    Available: <CheckCircle className="h-4 w-4" />,
    Maintenance: <Clock className="h-4 w-4" />,
};

function HallCard({ hall, availability }: { hall: Hall, availability?: { status: 'BOOKED' | 'AVAILABLE', customerName?: string } }) {
  const displayStatus = availability ? availability.status : hall.status;
  const colorClass = statusColorMap[displayStatus] || 'bg-gray-100 text-gray-800';
  const icon = statusIconMap[displayStatus] || <Building className="h-4 w-4"/>;
  const customerName = availability ? availability.customerName : hall.customerName;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{hall.name}</CardTitle>
          <Badge className={cn('flex items-center gap-1 capitalize', colorClass)}>
            {icon}
            {displayStatus.toLowerCase()}
          </Badge>
        </div>
        <CardDescription>Capacity: {hall.capacity} people</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Facilities</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {hall.facilities.map(facility => (
              <Badge key={facility} variant="secondary">{facility}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Price</p>
          <p className="font-semibold text-lg">₹{hall.price.toLocaleString()}/hr</p>
        </div>
        {customerName && (
             <div className="border-t pt-2">
                <p className="text-sm font-medium text-muted-foreground">Booked By</p>
                <p className="font-semibold">{customerName}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HallManagementDashboard() {
  const { halls, setHalls } = useContext(DataContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredHalls.map(hall => (
          <HallCard key={hall.id} hall={hall} availability={hallAvailabilities?.get(hall.id)} />
        ))}
      </div>

      <AddHallModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onHallAdded={handleHallAdded}
      />
    </div>
  );
}
