
"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  BedDouble,
  UtensilsCrossed,
  Wine,
  Box,
  Settings,
  Hotel,
  LogOut,
} from "lucide-react";
import { usePathname } from 'next/navigation';
import { useUserRole } from "@/hooks/use-user-role";

const allMenuItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: Home,
    roles: ["admin"],
  },
  {
    href: "/room-management",
    label: "Room Management",
    icon: BedDouble,
    roles: ["admin", "reception"],
  },
  {
    href: "/restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    roles: ["admin", "restaurant"],
  },
  {
    href: "/bar-liquor",
    label: "Bar & Liquor",
    icon: Wine,
    roles: ["admin", "bar"],
  },
  {
    href: "/stock-management",
    label: "Stock Management",
    icon: Box,
    roles: ["admin"],
  },
];

export default function HotelVistaSidebar() {
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
    if (userRole === 'admin') return allMenuItems.filter(item => item.roles.includes('admin'));
    return allMenuItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BedDouble className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">HotelVista</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Settings" }}>
              <a href="#">
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Log out" }} className="hover:bg-destructive/10 text-red-700 hover:text-red-800" onClick={handleLogout}>
              <a href="/login">
                <LogOut />
                <span>Log out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
