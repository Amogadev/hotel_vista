
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, LogOut, CalendarPlus, Wrench, Trash2, Pencil } from 'lucide-react';
import type { Room } from '@/context/data-provider';

type QuickActionsDropdownProps = {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onAction: (action: 'checkout' | 'maintenance', room: Room) => void;
};

export function QuickActionsDropdown({ room, onEdit, onDelete, onAction }: QuickActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(room)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('checkout', room)} disabled={room.status !== 'Occupied'}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Check-out</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(room)} disabled={room.status !== 'Occupied'}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          <span>Extend Stay</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('maintenance', room)} disabled={room.status === 'Maintenance'}>
          <Wrench className="mr-2 h-4 w-4" />
          <span>Mark for Maintenance</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(room)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Room</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
