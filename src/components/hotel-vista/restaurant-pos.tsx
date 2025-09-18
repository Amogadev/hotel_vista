'use client';

import React, { useState, useMemo, useContext } from 'react';
import {
  Search,
  Plus,
  Trash2,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DataContext, MenuItem as MenuItemType } from '@/context/data-provider';
import Link from 'next/link';

type OrderItem = MenuItemType & { quantity: number };

export default function RestaurantPOS() {
  const { menuItems: allMenuItems } = useContext(DataContext);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [acCharges, setAcCharges] = useState(false);

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) {
      return allMenuItems;
    }
    return allMenuItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMenuItems, searchTerm]);

  const menuByCategory = useMemo(() => {
    return filteredMenuItems.reduce((acc, item) => {
      const { category } = item;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItemType[]>);
  }, [filteredMenuItems]);

  const addToOrder = (item: MenuItemType) => {
    setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((orderItem) => orderItem.name === item.name);
      if (existingItem) {
        return prevOrder.map((orderItem) =>
          orderItem.name === item.name
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...prevOrder, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemName: string) => {
    setCurrentOrder((prevOrder) => prevOrder.filter((item) => item.name !== itemName));
  };
  
  const clearOrder = () => {
    setCurrentOrder([]);
    setAcCharges(false);
  };

  const { subtotal, total } = useMemo(() => {
    const sub = currentOrder.reduce((acc, item) => acc + parseFloat(item.price.replace('₹', '')) * item.quantity, 0);
    const ac = acCharges ? sub * 0.1 : 0;
    const grandTotal = sub + ac;
    return { subtotal: sub, ac: ac, total: grandTotal };
  }, [currentOrder, acCharges]);


  return (
    <div className="flex h-screen w-full bg-background font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6">
        <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Restaurant POS</h1>
            <Button variant="ghost" asChild>
                <Link href="/login" className='text-muted-foreground'>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Link>
            </Button>
        </header>
        
        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto pr-4">
            <h2 className="text-xl font-semibold text-foreground">Menu</h2>
            <p className="text-muted-foreground mb-4">Select items to add to order</p>

            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search menu items..." 
                        className="pl-10 bg-input border-0 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button size="icon" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="space-y-6">
                {Object.entries(menuByCategory).map(([category, items]) => (
                    <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-semibold uppercase text-foreground">{category}</h3>
                            <Badge variant="secondary" className='bg-muted text-muted-foreground'>{items.length} items</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {items.map((item) => (
                                <div key={item.name} className="bg-muted/50 rounded-lg p-3 flex flex-col justify-between">
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-green-400 font-medium">{item.price}</p>
                                    </div>
                                    <Button size="icon" className="mt-2 self-end h-8 w-8 bg-primary/80 hover:bg-primary" onClick={() => addToOrder(item)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* Order Sidebar */}
      <aside className="w-96 bg-secondary border-l border-border flex flex-col">
        <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Current Order</h2>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Table Name</label>
                    <Select defaultValue="TABLE-2">
                        <SelectTrigger className="bg-input border-0 focus:ring-primary">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TABLE-1">TABLE-1</SelectItem>
                            <SelectItem value="TABLE-2">TABLE-2</SelectItem>
                            <SelectItem value="TABLE-3">TABLE-3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Select Waiter</label>
                    <Select defaultValue="DEF-WAITER">
                        <SelectTrigger className="bg-input border-0 focus:ring-primary">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEF-WAITER">DEF-WAITER</SelectItem>
                            <SelectItem value="WAITER-2">WAITER-2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">AC Charges (10%)</label>
                    <Switch checked={acCharges} onCheckedChange={setAcCharges}/>
                </div>
            </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentOrder.length > 0 ? currentOrder.map(item => {
              const itemTotal = parseFloat(item.price.replace('₹', '')) * item.quantity;
              return (
                <div key={item.name} className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{parseFloat(item.price.replace('₹', '')).toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">₹{itemTotal.toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400" onClick={() => removeFromOrder(item.name)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              );
            }) : (
                <div className="text-center text-muted-foreground mt-10">
                    <p>No items in order.</p>
                </div>
            )}
        </div>
        
        <div className="p-6 mt-auto border-t border-border space-y-4">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">AC Charges</span>
                    <span className="font-medium text-foreground">₹{(total - subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{total.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" className='bg-muted text-muted-foreground'>Save & Print KOT</Button>
                <Button variant="destructive" className='bg-red-800/80 hover:bg-red-800 text-white' onClick={clearOrder}>Clear</Button>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" disabled={currentOrder.length === 0}>
                Generate Bill (₹{total.toFixed(2)})
            </Button>
        </div>
      </aside>
    </div>
  );
}
