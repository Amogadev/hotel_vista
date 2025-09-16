
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { getRooms, getMenuItems, getOrders, getBarProducts, getBarSales, getStockItems } from '@/app/actions';
import { format } from 'date-fns';

export type Room = {
    number: string;
    type: string;
    status: string;
    guest?: string;
    checkIn?: string;
    checkOut?: string;
    rate: string;
};

export type MenuItem = {
    name: string;
    category: string;
    price: string;
    status: string;
};

export type ActiveOrder = {
    id: string;
    status: string;
    table: number;
    items: string;
    time: Date;
    price: string;
    icon: React.ReactNode;
};

export type InventoryItem = {
    name: string;
    type: string;
    stock: number;
    price: number;
    status: 'good' | 'low' | 'critical';
};
  
export type RecentSale = {
    name: string;
    qty: number;
    room?: string;
    price: number;
    time: Date;
};

export type StockItem = {
    name: string;
    category: string;
    current: number;
    min: number;
    max: number;
    unit: string;
    supplier: string;
    status: 'critical' | 'low' | 'normal';
};

export type TotalBill = {
    room: string;
    restaurant: number;
};

type DataContextType = {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  activeOrders: ActiveOrder[];
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrder[]>>;
  inventoryItems: InventoryItem[];
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  recentSales: RecentSale[];
  setRecentSales: React.Dispatch<React.SetStateAction<RecentSale[]>>;
  stockItems: StockItem[];
  setStockItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
  totalBill: TotalBill[];
  setTotalBill: React.Dispatch<React.SetStateAction<TotalBill[]>>;
  loading: boolean;
};

const initialRooms: Room[] = [
    {
      number: '101',
      type: 'Standard Single',
      status: 'Occupied',
      guest: 'John Smith',
      checkIn: '2024-01-10',
      checkOut: '2024-01-12',
      rate: '₹120/night',
    },
    {
      number: '102',
      type: 'Deluxe Double',
      status: 'Available',
      rate: '₹180/night',
    },
    {
      number: '103',
      type: 'Suite',
      status: 'Cleaning',
      rate: '₹300/night',
    },
    {
      number: '201',
      type: 'Standard Double',
      status: 'Occupied',
      guest: 'Sarah Johnson',
      checkIn: '2024-01-09',
      checkOut: '2024-01-11',
      rate: '₹150/night',
    },
    {
      number: '202',
      type: 'Deluxe Single',
      status: 'Maintenance',
      rate: '₹140/night',
    },
    {
      number: '203',
      type: 'Suite',
      status: 'Available',
      rate: '₹320/night',
    },
];

const initialMenuItems = [
    {
      name: 'Grilled Salmon',
      category: 'Main Course',
      price: '₹28',
      status: 'Available',
    },
    {
      name: 'Caesar Salad',
      category: 'Appetizer',
      price: '₹12',
      status: 'Available',
    },
    {
      name: 'Ribeye Steak',
      category: 'Main Course',
      price: '₹45',
      status: 'Out of Stock',
    },
    {
      name: 'Chocolate Mousse',
      category: 'Dessert',
      price: '₹9',
      status: 'Available',
    },
];

const initialActiveOrders = [
    {
      id: 'ORD001',
      status: 'preparing',
      table: 5,
      items: 'Grilled Salmon, Caesar Salad',
      time: new Date(Date.now() - 15 * 60 * 1000),
      price: '₹40',
      icon: <Clock className="h-5 w-5 mr-2" />,
    },
    {
      id: 'ORD002',
      status: 'pending',
      table: 12,
      items: 'Ribeye Steak, Chocolate Mousse',
      time: new Date(Date.now() - 5 * 60 * 1000),
      price: '₹54',
      icon: <AlertCircle className="h-5 w-5 mr-2" />,
    },
    {
      id: 'ORD003',
      status: 'ready',
      table: 3,
      items: 'Caesar Salad, Chocolate Mousse',
      time: new Date(Date.now() - 25 * 60 * 1000),
      price: '₹21',
      icon: <CheckCircle2 className="h-5 w-5 mr-2" />,
    },
];

const initialInventoryItems = [
    {
      name: 'Premium Whiskey',
      type: 'Whiskey',
      stock: 24,
      price: 15,
      status: 'good' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Vodka Premium',
      type: 'Vodka',
      stock: 8,
      price: 12,
      status: 'low' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Craft Beer',
      type: 'Beer',
      stock: 48,
      price: 6,
      status: 'good' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Red Wine',
      type: 'Wine',
      stock: 16,
      price: 25,
      status: 'good' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Gin Tonic',
      type: 'Gin',
      stock: 5,
      price: 10,
      status: 'low' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Champagne',
      type: 'Champagne',
      stock: 12,
      price: 40,
      status: 'good' as 'good' | 'low' | 'critical',
    },
];
  
const initialRecentSales = [
    {
      name: 'Premium Whiskey',
      qty: 2,
      room: '201',
      price: 30,
      time: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      name: 'Red Wine',
      qty: 1,
      price: 25,
      time: new Date(Date.now() - 12 * 60 * 1000),
    },
    {
      name: 'Craft Beer',
      qty: 4,
      price: 24,
      time: new Date(Date.now() - 18 * 60 * 1000),
    },
    {
      name: 'Champagne',
      qty: 1,
      room: '101',
      price: 40,
      time: new Date(Date.now() - 25 * 60 * 1000),
    },
];

const initialStockItems: StockItem[] = [
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

const initialTotalBill: TotalBill[] = [
    {
        room: '101',
        restaurant: 50,
    },
    {
        room: '201',
        restaurant: 35,
    }
];

export const DataContext = createContext<DataContextType>({
  rooms: [],
  setRooms: () => {},
  menuItems: [],
  setMenuItems: () => {},
  activeOrders: [],
  setActiveOrders: () => {},
  inventoryItems: [],
  setInventoryItems: () => {},
  recentSales: [],
  setRecentSales: () => {},
  stockItems: [],
  setStockItems: () => {},
  totalBill: [],
  setTotalBill: () => {},
  loading: true,
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [totalBill, setTotalBill] = useState<TotalBill[]>(initialTotalBill);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, menuItemsRes, ordersRes, barProductsRes, barSalesRes, stockItemsRes] = await Promise.all([
                getRooms(),
                getMenuItems(),
                getOrders(),
                getBarProducts(),
                getBarSales(),
                getStockItems()
            ]);

            if (roomsRes.success) {
                const formattedRooms = roomsRes.rooms.map((room: any) => ({
                    ...room,
                    rate: `₹${room.price}/night`,
                    checkIn: room.checkIn ? format(new Date(room.checkIn), 'yyyy-MM-dd') : undefined,
                    checkOut: room.checkOut ? format(new Date(room.checkOut), 'yyyy-MM-dd') : undefined,
                }));
                setRooms(formattedRooms.length > 0 ? formattedRooms : initialRooms);
            }

            if (menuItemsRes.success) {
                const formattedMenuItems = menuItemsRes.items.map((item: any) => ({
                    ...item,
                    price: `₹${item.price}`
                }));
                setMenuItems(formattedMenuItems.length > 0 ? formattedMenuItems : initialMenuItems);
            }

            if (ordersRes.success) {
                const formattedOrders = ordersRes.orders.map((order: any) => ({
                    ...order,
                    price: `₹${order.price}`,
                    status: 'pending', // You might want to store status in DB
                    icon: <AlertCircle className="h-5 w-5 mr-2" />,
                }));
                setActiveOrders(formattedOrders.length > 0 ? formattedOrders : initialActiveOrders);
            }
            
            if (barProductsRes.success) {
                const getStatus = (stock: number): 'good' | 'low' | 'critical' => {
                    if (stock < 10) return 'critical';
                    if (stock < 20) return 'low';
                    return 'good';
                }
                const formattedBarProducts = barProductsRes.products.map((item: any) => ({
                    ...item,
                    status: getStatus(item.stock),
                }));
                setInventoryItems(formattedBarProducts.length > 0 ? formattedBarProducts : initialInventoryItems);
            }

            if (barSalesRes.success) {
                setRecentSales(barSalesRes.sales.length > 0 ? barSalesRes.sales : initialRecentSales);
            }

            if (stockItemsRes.success) {
                const getStatus = (current: number, min: number): 'critical' | 'low' | 'normal' => {
                    if (current < min) return 'critical';
                    if (current < min * 2) return 'low';
                    return 'normal';
                  };
                const formattedStockItems = stockItemsRes.items.map((item: any) => ({
                    ...item,
                    status: getStatus(item.current, item.min),
                }));
                setStockItems(formattedStockItems.length > 0 ? formattedStockItems : initialStockItems);
            }
            
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            // Fallback to initial data if fetch fails
            setRooms(initialRooms);
            setMenuItems(initialMenuItems);
            setActiveOrders(initialActiveOrders);
            setInventoryItems(initialInventoryItems);
            setRecentSales(initialRecentSales);
            setStockItems(initialStockItems);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        rooms,
        setRooms,
        menuItems,
        setMenuItems,
        activeOrders,
        setActiveOrders,
        inventoryItems,
        setInventoryItems,
        recentSales,
        setRecentSales,
        stockItems,
        setStockItems,
        totalBill,
        setTotalBill,
        loading,
      }}
    >
      {loading ? (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
       ) : (
        children
       )}
    </DataContext.Provider>
  );
};
