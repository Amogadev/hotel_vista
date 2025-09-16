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

export default function HotelVistaSidebar() {
  const pathname = usePathname();
  const menuItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/room-management",
      label: "Room Management",
      icon: BedDouble,
    },
    {
      href: "/restaurant",
      label: "Restaurant",
      icon: UtensilsCrossed,
    },
    {
      href: "/bar-liquor",
      label: "Bar & Liquor",
      icon: Wine,
    },
    {
      href: "/stock-management",
      label: "Stock Management",
      icon: Box,
    },
  ];

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
            <SidebarMenuButton asChild tooltip={{ children: "Log out" }} className="hover:bg-destructive/10 text-red-700 hover:text-red-800">
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
