
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
  useSidebar,
  SidebarRail,
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
import { Button } from "../ui/button";

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

type HotelVistaSidebarProps = {
    collapsible?: "icon" | "offcanvas" | "none";
}

export default function HotelVistaSidebar({ collapsible = "none" }: HotelVistaSidebarProps) {
  const pathname = usePathname();
  const userRole = useUserRole();
  const { toggleSidebar, state } = useSidebar();


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('activeUser');
    }
  };

  const menuItems = React.useMemo(() => {
    if (!userRole) return [];
    if (userRole === 'admin') return allMenuItems.filter(item => item.roles.includes('admin'));
    if (userRole === 'reception') {
      return [
        {
          href: "/room-management",
          label: "Room Management",
          icon: BedDouble,
          roles: ["admin", "reception"],
        }
      ]
    }
    return allMenuItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  return (
    <Sidebar collapsible={collapsible}>
        {collapsible === 'icon' && <SidebarRail onClick={toggleSidebar} />}
        <SidebarHeader className="p-0">
          <div 
              className="flex h-12 items-center justify-start px-3"
              role="button"
              onClick={toggleSidebar}
          >
              <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <BedDouble className="h-5 w-5" />
                  </div>
                  {state === 'expanded' && <span className="text-lg font-semibold">HotelVista</span>}
              </div>
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
                  {state === 'expanded' && <span>{item.label}</span>}
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
                {state === 'expanded' && <span>Settings</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Log out" }} className="hover:bg-destructive/10 text-red-700 hover:text-red-800" onClick={handleLogout}>
              <a href="/login">
                <LogOut />
                {state === 'expanded' && <span>Log out</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
