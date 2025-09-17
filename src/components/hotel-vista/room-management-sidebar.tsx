
'use client';

import { Bed, Calendar, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  {
    title: 'All Rooms',
    value: 'all-rooms',
    icon: Bed,
  },
  {
    title: 'Calendar View',
    value: 'calendar',
    icon: Calendar,
  },
  {
    title: 'Revenue',
    value: 'revenue',
    icon: BarChart2,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function RoomManagementSidebar({ className, activeView, setActiveView }: SidebarProps) {
  return (
    <div className={cn('pb-12 border-r', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Room Views
          </h2>
          <div className="space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.value}
                variant={activeView === item.value ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView(item.value)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
