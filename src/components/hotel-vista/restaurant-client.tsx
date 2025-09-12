'use client';

import {
  UtensilsCrossed,
  DollarSign,
  Clock,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
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

const stats = [
  {
    title: "Today's Orders",
    value: '47',
    icon: <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />,
  },
  {
    title: 'Revenue',
    value: '$2,340',
    icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
  },
  {
    title: 'Active Orders',
    value: '12',
    icon: <Clock className="h-6 w-6 text-muted-foreground" />,
  },
  {
    title: 'Avg. Order Value',
    value: '$49.79',
    icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
  },
];

const activeOrders = [
  {
    id: 'ORD001',
    status: 'preparing',
    table: 5,
    items: 'Grilled Salmon, Caesar Salad',
    time: '15 mins ago',
    price: '$40',
    icon: <Clock className="h-5 w-5 mr-2" />,
  },
  {
    id: 'ORD002',
    status: 'pending',
    table: 12,
    items: 'Ribeye Steak, Chocolate Mousse',
    time: '5 mins ago',
    price: '$54',
    icon: <AlertCircle className="h-5 w-5 mr-2" />,
  },
  {
    id: 'ORD003',
    status: 'ready',
    table: 3,
    items: 'Caesar Salad, Chocolate Mousse',
    time: '25 mins ago',
    price: '$21',
    icon: <CheckCircle2 className="h-5 w-5 mr-2" />,
  },
];

const menuItems = [
  {
    name: 'Grilled Salmon',
    category: 'Main Course',
    price: '$28',
    status: 'Available',
  },
  {
    name: 'Caesar Salad',
    category: 'Appetizer',
    price: '$12',
    status: 'Available',
  },
  {
    name: 'Ribeye Steak',
    category: 'Main Course',
    price: '$45',
    status: 'Out of Stock',
  },
  {
    name: 'Chocolate Mousse',
    category: 'Dessert',
    price: '$9',
    status: 'Available',
  },
];

const orderStatusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    preparing: 'default',
    pending: 'secondary',
    ready: 'outline',
};

const orderStatusColorMap: { [key: string]: string } = {
    preparing: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
};


const menuStatusVariantMap: { [key: string]: 'default' | 'destructive' } = {
    Available: 'default',
    'Out of Stock': 'destructive',
  };
  
const menuStatusColorMap: { [key: string]: string } = {
    Available: 'bg-green-100 text-green-800 border-green-200',
    'Out of Stock': 'bg-red-100 text-red-800 border-red-200',
};


function OrderCard({ order }: { order: (typeof activeOrders)[0] }) {
    const variant = orderStatusVariantMap[order.status] || 'default';
    const colorClass = orderStatusColorMap[order.status] || '';
  
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {order.icon}
              <p className="font-bold">{order.id}</p>
              <Badge variant={variant} className={`ml-2 capitalize ${colorClass}`}>{order.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{order.time}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Table {order.table}</p>
            <p className="text-sm font-medium">{order.items}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-bold">{order.price}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
}

function MenuItemCard({ item }: { item: (typeof menuItems)[0] }) {
    const variant = menuStatusVariantMap[item.status] || 'default';
    const colorClass = menuStatusColorMap[item.status] || '';

    return (
        <Card>
            <CardContent className="p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-lg font-semibold text-yellow-600">{item.price}</p>
                </div>
                <div className="text-right">
                    <Badge variant={variant} className={`capitalize mb-2 ${colorClass}`}>{item.status}</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                </div>
            </div>
            </CardContent>
        </Card>
    );
}
  

export default function RestaurantManagementDashboard() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Management</h1>
          <p className="text-muted-foreground">Manage menu items and orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Orders</h2>
            {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Menu Items</h2>
            {menuItems.map((item) => (
                <MenuItemCard key={item.name} item={item} />
            ))}
        </div>
      </div>
    </div>
  );
}
