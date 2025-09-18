
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

const statusColorMap: { [key: string]: string } = {
  Booked: 'bg-red-100 text-red-800 border-red-200',
  Available: 'bg-green-100 text-green-800 border-green-200',
  Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusIconMap: { [key: string]: React.ReactNode } = {
    Booked: <XCircle className="h-4 w-4" />,
    Available: <CheckCircle className="h-4 w-4" />,
    Maintenance: <Clock className="h-4 w-4" />,
};

function HallCard({ hall }: { hall: Hall }) {
  const colorClass = statusColorMap[hall.status] || 'bg-gray-100 text-gray-800';
  const icon = statusIconMap[hall.status];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{hall.name}</CardTitle>
          <Badge className={colorClass + ' flex items-center gap-1'}>
            {icon}
            {hall.status}
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
      </CardContent>
    </Card>
  );
}

export default function HallManagementDashboard() {
  const { halls, setHalls } = useContext(DataContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredHalls = useMemo(() => {
    return halls.filter(hall =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [halls, searchTerm]);

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

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full md:grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hall name..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredHalls.map(hall => (
          <HallCard key={hall.id} hall={hall} />
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
