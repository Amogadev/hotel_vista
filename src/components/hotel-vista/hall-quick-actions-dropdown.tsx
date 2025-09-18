
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, CalendarPlus, Wrench, Trash2, Pencil, XCircle, FilePlus } from 'lucide-react';
import type { Hall } from '@/context/data-provider';

type QuickActionsDropdownProps = {
  hall: Hall;
  onEdit: (hall: Hall) => void;
  onDelete: (hall: Hall) => void;
  onAction: (action: 'book' | 'maintenance' | 'cancel', hall: Hall) => void;
};

export function QuickActionsDropdown({ hall, onEdit, onDelete, onAction }: QuickActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hall.status === 'Available' && (
             <DropdownMenuItem onClick={() => onAction('book', hall)}>
                <FilePlus className="mr-2 h-4 w-4" />
                <span>Book Hall</span>
            </DropdownMenuItem>
        )}
         {hall.status === 'Booked' && (
             <DropdownMenuItem onClick={() => onAction('cancel', hall)}>
                <XCircle className="mr-2 h-4 w-4" />
                <span>Cancel Booking</span>
            </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(hall)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(hall)} disabled={hall.status !== 'Booked'}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          <span>Extend Booking</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('maintenance', hall)} disabled={hall.status === 'Maintenance'}>
          <Wrench className="mr-2 h-4 w-4" />
          <span>Mark for Maintenance</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(hall)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Hall</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    