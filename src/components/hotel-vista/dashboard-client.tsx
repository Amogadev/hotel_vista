
"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "./stat-card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  BedDouble,
  Users,
  UtensilsCrossed,
  Wine,
  Plus,
  CalendarCheck,
  PackagePlus,
  ClipboardList
} from "lucide-react";
import Link from "next/link";


const activityItems = [
    {
      icon: <CalendarCheck className="h-5 w-5 text-blue-500" />,
      description: "Room 204 checked in",
      time: "2m ago",
    },
    {
      icon: <UtensilsCrossed className="h-5 w-5 text-yellow-500" />,
      description: "New restaurant order #1247",
      time: "5m ago",
    },
    {
      icon: <Wine className="h-5 w-5 text-purple-500" />,
      description: "Bar sale – Premium Whiskey",
      time: "10m ago",
    },
    {
      icon: <PackagePlus className="h-5 w-5 text-green-500" />,
      description: "New stock delivered: Linens",
      time: "30m ago",
    },
    {
      icon: <ClipboardList className="h-5 w-5 text-red-500" />,
      description: "Stock alert: Low towels",
      time: "1h ago",
    },
  ];

const chartData = [
    { name: 'Jan', revenue: 32000 },
    { name: 'Feb', revenue: 38000 },
    { name: 'Mar', revenue: 42000 },
    { name: 'Apr', revenue: 39000 },
    { name: 'May', revenue: 45000 },
    { name: 'Jun', revenue: 48000 },
];

export default function Dashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: "₹45,231",
      trend: "+12.5% from last month",
      trendColor: "text-green-600",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Occupied Rooms",
      value: "85 / 120",
      trend: "+6.3% from last month",
      trendColor: "text-blue-600",
      icon: <BedDouble className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Active Guests",
      value: "203",
      trend: "+8.2% from last month",
      trendColor: "text-orange-600",
      icon: <Users className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Restaurant Orders",
      value: "47",
      trend: "+15.3% from last month",
      trendColor: "text-yellow-600",
      icon: <UtensilsCrossed className="h-5 w-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip
                    contentStyle={{ 
                        borderRadius: '0.5rem', 
                        border: '1px solid hsl(var(--border))', 
                        background: 'hsl(var(--background))' 
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button asChild variant="outline">
                        <Link href="/room-management">Add New Room <Plus className="ml-auto" /></Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/bar-liquor">Record Bar Sale <Wine className="ml-auto" /></Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/restaurant">New Restaurant Order <UtensilsCrossed className="ml-auto" /></Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.description}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
