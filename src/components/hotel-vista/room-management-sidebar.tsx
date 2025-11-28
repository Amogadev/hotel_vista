
'use client';

import { Bed, Calendar, BarChart2, PanelLeft, ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    title: "Today's Income",
    value: 'todays-income',
    icon: BarChart2,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export function RoomManagementSidebar({ className, activeView, setActiveView, isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <TooltipProvider>
      <div className={cn(
        'pb-12 border-r transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            {!isCollapsed && (
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Room Views
              </h2>
            )}
            <div className="space-y-1">
              {sidebarNavItems.map((item) => (
                isCollapsed ? (
                  <Tooltip key={item.value} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeView === item.value ? 'secondary' : 'ghost'}
                        className="w-full justify-center"
                        onClick={() => setActiveView(item.value)}
                        size="icon"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.title}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    key={item.value}
                    variant={activeView === item.value ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView(item.value)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                )
              ))}
            </div>
             <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="icon"
              variant="ghost"
              className="mt-4 w-full justify-center"
            >
              {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
