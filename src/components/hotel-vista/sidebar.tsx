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
} from "lucide-react";

export default function HotelVistaSidebar() {
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
      isActive: true, // Since it's a single page app for now
    },
    {
      href: "#",
      label: "Restaurant",
      icon: UtensilsCrossed,
    },
    {
      href: "#",
      label: "Bar & Liquor",
      icon: Wine,
    },
    {
      href: "#",
      label: "Stock Management",
      icon: Box,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hotel className="h-5 w-5" />
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
                isActive={item.isActive}
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
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
