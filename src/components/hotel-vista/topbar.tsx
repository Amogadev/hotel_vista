
'use client';

import React from 'react';
import {
  Home,
  BedDouble,
  UtensilsCrossed,
  Wine,
  Box,
  Settings,
  LogOut,
  FileText,
  Users,
  Building,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const allMenuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    roles: ['admin'],
  },
  {
    href: '/room-management',
    label: 'Room Management',
    icon: BedDouble,
    roles: ['admin', 'reception'],
  },
  {
    href: '/hall-management',
    label: 'Hall Management',
    icon: Building,
    roles: ['admin'],
  },
  {
    href: '/total-bill',
    label: 'Total Bill',
    icon: FileText,
    roles: ['admin', 'reception'],
  },
  {
    href: '/restaurant',
    label: 'Restaurant',
    icon: UtensilsCrossed,
    roles: ['admin', 'restaurant'],
  },
  {
    href: '/bar-liquor',
    label: 'Bar & Liquor',
    icon: Wine,
    roles: ['admin', 'bar'],
  },
  {
    href: '/stock-management',
    label: 'Stock Management',
    icon: Box,
    roles: ['admin'],
  },
];

export default function Topbar() {
  const pathname = usePathname();
  const userRole = useUserRole();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('activeUser');
    }
  };

  const menuItems = React.useMemo(() => {
    if (!userRole) return [];
    if (userRole === 'admin')
      return allMenuItems.filter((item) => item.roles.includes('admin'));
    if (userRole === 'reception') {
        return allMenuItems.filter(item => item.roles.includes('reception'));
    }
    return allMenuItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
      <div className="px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BedDouble className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">HotelVista</span>
            </Link>
             <Separator orientation="vertical" className="h-6 mx-1" />
            <nav className="hidden md:flex items-center gap-0">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  asChild
                  className="text-sm px-2 py-1 h-auto"
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              asChild
            >
              <Link href="/login">
                <LogOut className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
