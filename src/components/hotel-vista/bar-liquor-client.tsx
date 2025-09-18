
'use client';

import React, { useState, useMemo, useContext, useTransition, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Search,
  Plus,
  Trash2,
  LogOut,
  Printer
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DataContext, InventoryItem as InventoryItemType } from '@/context/data-provider';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { recordBarSale, updateBarProductStock } from '@/app/actions';
import { RecordSaleModal } from './record-sale-modal';
import { BarReceiptPrint, type BarReceiptPrintProps } from './bar-receipt-print';

type SaleItem = InventoryItemType & { quantity: number };

export default function BarPOS() {
  const { inventoryItems, setInventoryItems, rooms, recentSales, setRecentSales } = useContext(DataContext);
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('direct-sale');
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false);
  
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handlePrint = (receiptData: BarReceiptPrintProps) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = renderToString(<BarReceiptPrint {...receiptData} />);
      printWindow.document.write(`
        <html>
          <head>
            <title>Bar Receipt</title>
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

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return inventoryItems;
    }
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryItems, searchTerm]);

  const itemsByCategory = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const { type } = item;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    }, {} as Record<string, InventoryItemType[]>);
  }, [filteredItems]);

  const addToSale = (item: InventoryItemType) => {
    if (item.stock <= 0) {
        toast({
            variant: 'destructive',
            title: 'Out of Stock',
            description: `${item.name} is currently out of stock.`,
        });
        return;
    }
    setCurrentSale((prevSale) => {
      const existingItem = prevSale.find((saleItem) => saleItem.name === item.name);
      if (existingItem) {
        if (existingItem.quantity < item.stock) {
            return prevSale.map((saleItem) =>
            saleItem.name === item.name
                ? { ...saleItem, quantity: saleItem.quantity + 1 }
                : saleItem
            );
        } else {
            toast({
                variant: 'destructive',
                title: 'Stock Limit Reached',
                description: `You cannot add more ${item.name} than available in stock.`,
            });
            return prevSale;
        }
      }
      return [...prevSale, { ...item, quantity: 1 }];
    });
  };

  const removeFromSale = (itemName: string) => {
    setCurrentSale((prevSale) => prevSale.filter((item) => item.name !== itemName));
  };
  
  const clearSale = () => {
    setCurrentSale([]);
    setSelectedRoom('direct-sale');
  };

  const updateQuantity = (itemName: string, quantity: number) => {
    const itemInStock = inventoryItems.find(i => i.name === itemName);
    if (!itemInStock) return;

    if (quantity > 0 && quantity <= itemInStock.stock) {
      setCurrentSale(prevSale => prevSale.map(item => 
        item.name === itemName ? { ...item, quantity } : item
      ));
    } else if (quantity > itemInStock.stock) {
        toast({
            variant: 'destructive',
            title: 'Stock Limit Exceeded',
            description: `Only ${itemInStock.stock} units of ${itemName} available.`
        });
    }
  };

  const { subtotal, total } = useMemo(() => {
    const sub = currentSale.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return { subtotal: sub, total: sub }; // No extra charges for now
  }, [currentSale]);

  const handleFinalizeSale = () => {
    if (currentSale.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Sale',
        description: 'Please add items to the sale.',
      });
      return;
    }
    setIsRecordSaleModalOpen(true);
  };
  
  const handlePrintReceipt = () => {
    if (currentSale.length === 0) {
        toast({
            variant: 'destructive',
            title: "Empty Sale",
            description: "Cannot print a receipt for an empty sale.",
        });
        return;
    }

    const receiptData: BarReceiptPrintProps = {
        billNo: `BAR-${Date.now()}`,
        date: new Date(),
        items: currentSale.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total,
        room: selectedRoom && selectedRoom !== 'direct-sale' ? selectedRoom : undefined,
    };
    
    handlePrint(receiptData);
  };

  const handleSaleRecorded = async () => {
    const roomToCharge = selectedRoom && selectedRoom !== 'direct-sale' ? selectedRoom : undefined;

    const salePromises = currentSale.map(item => 
      recordBarSale({
        name: item.name,
        qty: item.quantity,
        price: item.price * item.quantity,
        room: roomToCharge,
      })
    );

    const stockUpdatePromises = currentSale.map(item => {
        const originalItem = inventoryItems.find(i => i.name === item.name);
        const newStock = (originalItem?.stock || 0) - item.quantity;
        return updateBarProductStock(item.name, newStock);
    });

    try {
        await Promise.all([...salePromises, ...stockUpdatePromises]);
        
        // Optimistically update context
        const newSales: any[] = currentSale.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: item.price * item.quantity,
            room: roomToCharge,
            time: new Date(),
        }));
        setRecentSales(prev => [...newSales, ...prev]);

        setInventoryItems(prevItems => {
            const newItems = [...prevItems];
            currentSale.forEach(saleItem => {
                const itemIndex = newItems.findIndex(i => i.name === saleItem.name);
                if (itemIndex > -1) {
                    newItems[itemIndex].stock -= saleItem.quantity;
                }
            });
            return newItems;
        });

        toast({
            title: 'Sale Recorded',
            description: 'The sale has been successfully recorded and stock updated.',
        });

        clearSale();

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was an error recording the sale.',
        });
    }
  };


  return (
    <main className="h-screen overflow-hidden flex bg-background font-sans">
      <div className="flex-1 flex flex-col p-6">
        <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Bar &amp; Liquor</h1>
            <Button variant="ghost" asChild>
                <Link href="/"><LogOut className="mr-2" /> Exit</Link>
            </Button>
        </header>
        
        <div className="flex-1 overflow-y-auto pr-4">
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search products..." 
                        className="pl-10 bg-card border-border focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="space-y-6">
                {Object.entries(itemsByCategory).map(([category, items]) => (
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
                                        <p className="text-primary font-medium">₹{item.price}</p>
                                    </div>
                                    <Button size="icon" className="mt-2 self-end h-8 w-8 bg-primary/80 hover:bg-primary" onClick={() => addToSale(item)}>
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

      <aside className="w-96 bg-card border-l border-border flex flex-col">
        <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Current Order</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Add to Room Bill (Optional)</label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger className="bg-secondary border-0 focus:ring-primary">
                            <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="direct-sale">None (Direct Sale)</SelectItem>
                            {rooms.filter(r => r.status === 'Occupied').map(room => (
                                <SelectItem key={room.number} value={room.number}>
                                    Room {room.number} ({room.guest})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentSale.length > 0 ? currentSale.map(item => (
              <div key={item.name} className="flex items-start justify-between">
                  <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.name, parseInt(e.target.value))}
                        className="h-8 w-16"
                        min="1"
                        max={item.stock}
                      />
                      <p className="font-semibold text-foreground w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromSale(item.name)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
            )) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>No item</p>
                </div>
            )}
        </div>
        
        <div className="p-6 border-t border-border space-y-4">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{total.toFixed(2)}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                 <Button variant="destructive" onClick={clearSale}>Clear</Button>
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleFinalizeSale} disabled={currentSale.length === 0 || isPending}>
                    Finalize Sale
                </Button>
            </div>
             <Button variant="outline" className="w-full" onClick={handlePrintReceipt} disabled={currentSale.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
            </Button>
        </div>
      </aside>
       <RecordSaleModal
            isOpen={isRecordSaleModalOpen}
            onClose={() => setIsRecordSaleModalOpen(false)}
            onSaleRecorded={handleSaleRecorded}
            saleItems={currentSale}
            total={total}
            room={selectedRoom && selectedRoom !== 'direct-sale' ? selectedRoom : undefined}
        />
      </main>
  );
}
