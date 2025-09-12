'use client';

import React from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Box,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const stats = [
  {
    title: 'Critical Stock',
    value: '3',
    icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
  },
  {
    title: 'Low Stock',
    value: '1',
    icon: <TrendingDown className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: 'Total Items',
    value: '6',
    icon: <Box className="h-6 w-6 text-blue-500" />,
  },
];

const stockItems = [
  {
    name: 'Bath Towels',
    category: 'Linens',
    current: 15,
    min: 25,
    max: 100,
    unit: 'pieces',
    supplier: 'Hotel Supplies Co.',
    status: 'critical',
  },
  {
    name: 'Toilet Paper',
    category: 'Bathroom',
    current: 45,
    min: 30,
    max: 200,
    unit: 'rolls',
    supplier: 'Clean Supply Inc.',
    status: 'low',
  },
  {
    name: 'Bed Sheets',
    category: 'Linens',
    current: 8,
    min: 20,
    max: 80,
    unit: 'sets',
    supplier: 'Hotel Supplies Co.',
    status: 'critical',
  },
  {
    name: 'Hand Soap',
    category: 'Bathroom',
    current: 35,
    min: 15,
    max: 60,
    unit: 'bottles',
    supplier: 'Clean Supply Inc.',
    status: 'normal',
  },
  {
    name: 'Coffee Pods',
    category: 'Room Service',
    current: 120,
    min: 50,
    max: 300,
    unit: 'pods',
    supplier: 'Beverage Direct',
    status: 'normal',
  },
  {
    name: 'Vacuum Bags',
    category: 'Cleaning',
    current: 5,
    min: 10,
    max: 50,
    unit: 'pieces',
    supplier: 'Clean Supply Inc.',
    status: 'critical',
  },
];

const statusVariantMap: { [key: string]: 'destructive' | 'default' | 'outline' } = {
  critical: 'destructive',
  low: 'default',
  normal: 'outline',
};

const statusColorMap: { [key: string]: string } = {
  critical: 'bg-red-400 text-red-950 border-red-500',
  low: 'bg-yellow-400 text-yellow-950 border-yellow-500',
  normal: 'bg-blue-400 text-blue-950 border-blue-500',
};

const progressColorMap: { [key: string]: string } = {
    critical: 'bg-red-500',
    low: 'bg-yellow-500',
    normal: 'bg-primary'
  };

export default function StockManagementDashboard() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">
            Monitor inventory levels and manage supplies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Box className="mr-2 h-4 w-4" />
            Stock Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search stock items..." className="pl-10 w-full md:w-auto" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="default">All</Button>
              <Button variant="outline">Linens</Button>
              <Button variant="outline">Bathroom</Button>
              <Button variant="outline">Room Service</Button>
              <Button variant="outline">Cleaning</Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {stockItems.map((item) => {
            const stockPercentage = (item.current / item.max) * 100;
            const progressClass = progressColorMap[item.status] || 'bg-primary';
            return (
                <Card key={item.name}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className='text-lg font-bold'>{item.name}</CardTitle>
                            <CardDescription>{item.category}</CardDescription>
                        </div>
                        <Badge variant={statusVariantMap[item.status]} className={statusColorMap[item.status]}>
                            {item.status}
                        </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-bold">{item.current} {item.unit}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-bold">{item.min} {item.unit}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-bold">{item.max} {item.unit}</p>
                        </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Stock Level</span>
                                <span>{stockPercentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={stockPercentage} className="h-2 [&>div]:bg-primary" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Supplier</p>
                                <p className="font-semibold">{item.supplier}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">Update</Button>
                                <Button variant="secondary">Reorder</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
