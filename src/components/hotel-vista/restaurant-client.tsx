
'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  DollarSign,
  Clock,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
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
import { AddMenuItemModal, MenuItemFormValues } from './add-menu-item-modal';
import { EditMenuItemModal, EditMenuItemFormValues } from './edit-menu-item-modal';
import { NewOrderModal, OrderFormValues } from './new-order-modal';
import { formatDistanceToNow } from 'date-fns';

const useTimeAgo = (date: Date) => {
  const [timeAgo, setTimeAgo] = useState(() =>
    formatDistanceToNow(date, { addSuffix: true })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
};

const stats = [
  {
    title: "Today's Orders",
    value: '47',
    icon: <UtensilsCrossed className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'Revenue',
    value: '$2,340',
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Active Orders',
    value: '12',
    icon: <Clock className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: 'Avg. Order Value',
    value: '$49.79',
    icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
  },
];

const initialActiveOrders = [
  {
    id: 'ORD001',
    status: 'preparing',
    table: 5,
    items: 'Grilled Salmon, Caesar Salad',
    time: new Date(Date.now() - 15 * 60 * 1000),
    price: '$40',
    icon: <Clock className="h-5 w-5 mr-2" />,
  },
  {
    id: 'ORD002',
    status: 'pending',
    table: 12,
    items: 'Ribeye Steak, Chocolate Mousse',
    time: new Date(Date.now() - 5 * 60 * 1000),
    price: '$54',
    icon: <AlertCircle className="h-5 w-5 mr-2" />,
  },
  {
    id: 'ORD003',
    status: 'ready',
    table: 3,
    items: 'Caesar Salad, Chocolate Mousse',
    time: new Date(Date.now() - 25 * 60 * 1000),
    price: '$21',
    icon: <CheckCircle2 className="h-5 w-5 mr-2" />,
  },
];

const initialMenuItems = [
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

type MenuItem = {
    name: string;
    category: string;
    price: string;
    status: string;
};

type ActiveOrder = Omit<(typeof initialActiveOrders)[0], 'time'> & { time: Date };

const orderStatusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    preparing: 'default',
    pending: 'secondary',
    ready: 'outline',
};

const orderStatusColorMap: { [key: string]: string } = {
    preparing: 'bg-blue-400 text-blue-950 border-blue-500',
    pending: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    ready: 'bg-green-400 text-green-950 border-green-500',
};


const menuStatusVariantMap: { [key: string]: 'default' | 'destructive' } = {
    Available: 'default',
    'Out of Stock': 'destructive',
  };
  
const menuStatusColorMap: { [key: string]: string } = {
    Available: 'bg-green-400 text-green-950 border-green-500',
    'Out of Stock': 'bg-red-400 text-red-950 border-red-500',
};


function OrderCard({ order }: { order: ActiveOrder }) {
    const variant = orderStatusVariantMap[order.status] || 'default';
    const colorClass = orderStatusColorMap[order.status] || '';
    const timeAgo = useTimeAgo(order.time);
  
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {order.icon}
              <p className="font-bold">{order.id}</p>
              <Badge variant={variant} className={`ml-2 capitalize ${colorClass}`}>{order.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
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

function MenuItemCard({ item, onEditItem }: { item: MenuItem, onEditItem: (item: MenuItem) => void }) {
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
                    <Button variant="outline" size="sm" onClick={() => onEditItem(item)}>Edit</Button>
                </div>
            </div>
            </CardContent>
        </Card>
    );
}
  

export default function RestaurantManagementDashboard() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(initialActiveOrders);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  const handleOpenAddMenuItemModal = () => {
    setIsAddMenuItemModalOpen(true);
  };

  const handleCloseAddMenuItemModal = () => {
    setIsAddMenuItemModalOpen(false);
  };

  const handleMenuItemAdded = (newItemData: MenuItemFormValues) => {
    const newMenuItem: MenuItem = {
      name: newItemData.name,
      category: newItemData.category,
      price: `$${newItemData.price}`,
      status: newItemData.status,
    };
    setMenuItems(prevItems => [...prevItems, newMenuItem]);
    handleCloseAddMenuItemModal();
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsEditMenuItemModalOpen(true);
  };

  const handleCloseEditMenuItemModal = () => {
    setIsEditMenuItemModalOpen(false);
    setEditingMenuItem(null);
  };

  const handleMenuItemUpdated = (updatedItemData: EditMenuItemFormValues & { originalName: string }) => {
    const updatedMenuItem: MenuItem = {
        name: updatedItemData.name,
        category: updatedItemData.category,
        price: `$${updatedItemData.price}`,
        status: updatedItemData.status,
    };
    setMenuItems(prevItems =>
        prevItems.map(item => (item.name === updatedItemData.originalName ? updatedMenuItem : item))
    );
    handleCloseEditMenuItemModal();
  };

  const handleOpenNewOrderModal = () => {
    setIsNewOrderModalOpen(true);
  };

  const handleCloseNewOrderModal = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleOrderAdded = (newOrderData: OrderFormValues) => {
    const newOrder: ActiveOrder = {
      id: `ORD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      status: 'pending',
      table: newOrderData.table,
      items: newOrderData.items,
      time: new Date(),
      price: `$${newOrderData.price}`,
      icon: <AlertCircle className="h-5 w-5 mr-2" />,
    };
    setActiveOrders(prevOrders => [newOrder, ...prevOrders]);
    handleCloseNewOrderModal();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Management</h1>
          <p className="text-muted-foreground">Manage menu items and orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenNewOrderModal}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
          <Button onClick={handleOpenAddMenuItemModal}>
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
                <MenuItemCard key={item.name} item={item} onEditItem={handleEditMenuItem} />
            ))}
        </div>
      </div>
      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={handleCloseAddMenuItemModal}
        onMenuItemAdded={handleMenuItemAdded}
      />
      {editingMenuItem && (
        <EditMenuItemModal
            isOpen={isEditMenuItemModalOpen}
            onClose={handleCloseEditMenuItemModal}
            onMenuItemUpdated={handleMenuItemUpdated}
            menuItem={editingMenuItem}
        />
      )}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={handleCloseNewOrderModal}
        onOrderAdded={handleOrderAdded}
      />
    </div>
  );
}
