
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Moon, TrendingUp, BarChart } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import type { Room } from '@/context/data-provider';
import { parseISO, isToday, isSameMonth } from 'date-fns';

type RoomRevenueViewProps = {
  rooms: Room[];
};

export function RoomRevenueView({ rooms }: RoomRevenueViewProps) {
  const revenueData = useMemo(() => {
    const today = new Date();
    let revenueToday = 0;
    let revenueThisMonth = 0;
    
    const monthlyData: { [key: string]: number } = {};

    rooms.forEach(room => {
      if (room.status === 'Occupied' && room.totalPrice && room.checkIn) {
        const checkInDate = parseISO(room.checkIn);

        // Daily Revenue
        if (isToday(checkInDate)) {
          revenueToday += room.price; // Simplified: adds first night's price if checked in today
        }
        
        // Monthly Revenue
        if (isSameMonth(checkInDate, today)) {
          revenueThisMonth += room.totalPrice;
        }

        // Chart Data
        const month = checkInDate.toLocaleString('default', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += room.totalPrice;
      }
    });

    const chartData = Object.keys(monthlyData).map(month => ({
      name: month,
      revenue: monthlyData[month],
    })).slice(-6); // Last 6 months

    return { revenueToday, revenueThisMonth, chartData };
  }, [rooms]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <span>Revenue Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Revenue Today</p>
              <p className="text-2xl font-bold">₹{revenueData.revenueToday.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Revenue This Month</p>
              <p className="text-2xl font-bold">₹{revenueData.revenueThisMonth.toLocaleString()}</p>
            </div>
            <Moon className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            <span>Monthly Revenue Trend</span>
          </CardTitle>
          <CardDescription>
            Revenue from bookings over the last few months.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={revenueData.chartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '0.5rem', 
                            border: '1px solid hsl(var(--border))', 
                            background: 'hsl(var(--background))' 
                        }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
