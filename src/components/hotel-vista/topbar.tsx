
'use client';

import React, { useState } from 'react';
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
  Menu,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const allMenuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/room-management',
    label: 'Room Management',
    icon: BedDouble,
  },
  {
    href: '/hall-management',
    label: 'Hall Management',
    icon: Building,
  },
  {
    href: '/restaurant',
    label: 'Restaurant',
    icon: UtensilsCrossed,
  },
  {
    href: '/bar-liquor',
    label: 'Bar & Liquor',
    icon: Wine,
  },
  {
    href: '/stock-management',
    label: 'Stock Management',
    icon: Box,
  },
  {
    href: '/total-bill',
    label: 'Total Bill',
    icon: FileText,
  },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // In a real app, you'd clear tokens, etc.
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
      <div className="px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BedDouble className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">HotelVista</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0">
            {allMenuItems.map((item) => (
              <Button
                key={item.label}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                asChild
                className="text-sm px-3 py-1 h-auto"
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:inline-flex">
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Mobile Navigation */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {allMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 text-muted-foreground transition-all hover:text-primary",
                        pathname === item.href && "bg-muted text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                  <Separator className="my-2" />
                  <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full justify-start p-3">
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
