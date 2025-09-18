

'use client';

import React, { useState, useMemo, useContext, useTransition, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Search,
  Plus,
  Trash2,
  LogOut,
  Loader2
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
import { DataContext, MenuItem as MenuItemType, ActiveOrder } from '@/context/data-provider';
import Link from 'next/link';
import { KotPrint, type KotPrintProps } from './kot-print';
import { useToast } from '@/hooks/use-toast';
import { addOrder } from '@/app/actions';
import { BillModal } from './bill-modal';

type OrderItem = MenuItemType & { quantity: number };

export default function RestaurantPOS() {
  const { menuItems: allMenuItems, activeOrders, setActiveOrders } = useContext(DataContext);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [acCharges, setAcCharges] = useState(false);
  const [selectedTable, setSelectedTable] = useState('TABLE-1');
  const [selectedWaiter, setSelectedWaiter] = useState('WAITER 1');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handlePrint = (kotData: KotPrintProps) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = renderToString(<KotPrint {...kotData} />);
      printWindow.document.write(`
        <html>
          <head>
            <title>Kitchen Order Ticket</title>
            <style>
              @media print {
                body { 
                  font-family: monospace; 
                  margin: 0;
                }
                .p-8 { padding: 0.5rem; }
                .text-xs { font-size: 10px; }
                .text-black { color: #000; }
                .bg-white { background-color: #fff; }
                .text-center { text-align: center; }
                .space-y-1 > * + * { margin-top: 0.25rem; }
                .text-sm { font-size: 12px; }
                .font-bold { font-weight: 700; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
                .border-t { border-top-width: 1px; }
                .border-b { border-bottom-width: 1px; }
                .border-dashed { border-style: dashed; }
                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .text-right { text-align: right; }
                .w-full { width: 100%; }
                table { width: 100%; border-collapse: collapse; }
                thead { display: table-header-group; }
                tr { page-break-inside: avoid; }
                .text-left { text-align: left; }
                .mt-4 { margin-top: 1rem; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };


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

  const handleSaveAndPrint = () => {
    if(currentOrder.length === 0) {
        toast({
            variant: 'destructive',
            title: "Empty Order",
            description: "Cannot print an empty order.",
        })
        return;
    }

    startTransition(async () => {
        try {
            const newOrderPayload = {
                table: parseInt(selectedTable.split('-')[1]),
                items: currentOrder.map(item => `${item.quantity}x ${item.name}`).join(', '),
                price: total,
            }
            const result = await addOrder(newOrderPayload);

            if(result.success && result.order) {
                const newOrderNumber = (activeOrders.length + 1).toString().padStart(3, '0');
                const newActiveOrder: ActiveOrder = {
                    id: result.order.id,
                    status: 'pending',
                    table: newOrderPayload.table,
                    items: newOrderPayload.items,
                    price: `₹${newOrderPayload.price.toFixed(2)}`,
                    time: new Date(),
                    icon: <></>,
                };
                setActiveOrders(prev => [...prev, newActiveOrder]);

                const kotData: KotPrintProps = {
                    billNo: `Order ${newOrderNumber}`,
                    table: selectedTable,
                    waiter: selectedWaiter,
                    date: new Date(),
                    items: currentOrder.map(item => ({ name: item.name, quantity: item.quantity })),
                };
                
                handlePrint(kotData);
                
                toast({
                    title: "Order Placed",
                    description: `Your order for ${selectedTable} has been sent to the kitchen.`,
                });

                clearOrder();

            } else {
                throw new Error(result.error || 'Failed to save order');
            }

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error",
                description: (error as Error).message || "Failed to save and print.",
            })
        }
    })
  }

  const handleGenerateBill = () => {
    if (currentOrder.length > 0) {
      setIsBillModalOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Empty Order',
        description: 'Cannot generate a bill for an empty order.',
      });
    }
  };

  const currentActiveOrderForBill: ActiveOrder = {
    id: `ORD${(activeOrders.length + 1).toString().padStart(3, '0')}`,
    status: 'pending',
    table: parseInt(selectedTable.split('-')[1]),
    items: currentOrder.map(i => `${i.quantity}x ${i.name}`).join(', '),
    time: new Date(),
    price: `₹${total.toFixed(2)}`,
    icon: <></>,
  };

  return (
    <div className="h-screen overflow-hidden flex bg-background font-sans">
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Restaurant POS</h1>
            <Button variant="ghost" asChild>
                <Link href="/"><LogOut className="mr-2" /> Exit</Link>
            </Button>
        </header>
        
        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto pr-4">
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search menu items..." 
                        className="pl-10 bg-card border-border focus-visible:ring-primary"
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
                            <Badge variant="secondary">{items.length} items</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {items.map((item) => (
                                <div key={item.name} className="bg-card rounded-lg p-3 flex flex-col justify-between border">
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-primary font-medium">{item.price}</p>
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
      </div>

      {/* Order Sidebar */}
      <aside className="w-96 bg-card border-l border-border flex flex-col">
        <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Current Order</h2>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Table Name</label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                        <SelectTrigger className="bg-secondary border-0 focus:ring-primary">
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
                    <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                        <SelectTrigger className="bg-secondary border-0 focus:ring-primary">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="WAITER 1">WAITER 1</SelectItem>
                            <SelectItem value="WAITER 2">WAITER 2</SelectItem>
                            <SelectItem value="WAITER 3">WAITER 3</SelectItem>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromOrder(item.name)}>
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
                <Button variant="secondary" onClick={handleSaveAndPrint} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Print
                </Button>
                <Button variant="destructive" onClick={clearOrder}>Clear</Button>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleGenerateBill} disabled={currentOrder.length === 0}>
                Generate Bill (₹{total.toFixed(2)})
            </Button>
        </div>
      </aside>
       {isBillModalOpen && (
        <BillModal
          order={currentActiveOrderForBill}
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
        />
      )}
      </div>
  );
}
