
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { getRooms, getRestaurantMenuItems, getOrders, getBarProducts, getBarSales, getStockItems, getHalls } from '@/app/actions';
import { format, isPast, parseISO } from 'date-fns';

export type Room = {
    number: string;
    type: string;
    status: string;
    guest?: string;
    peopleCount?: number;
    idProof?: string;
    email?: string;
    checkIn?: string;
    checkOut?: string;
    price: number;
    totalPrice?: number;
    facilities?: string[];
};

export type Hall = {
    id: string;
    name: string;
    capacity: number;
    facilities: string[];
    price: number; // per hour
    status: 'Available' | 'Booked' | 'Maintenance';
    customerName?: string;
    contact?: string;
    purpose?: string;
    checkIn?: string;
    checkOut?: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalPrice?: number;
    idProof?: string;
    email?: string;
    adults?: number;
    children?: number;
    foodPreference?: 'veg' | 'non-veg' | 'both';
    addOns?: string[];
    foodCost?: number;
};

export type MenuItem = {
    name: string;
    category: string;
    price: number;
    status: string;
};

export type ActiveOrder = {
    id: string;
    status: string;
    table: number;
    items: string;
    time: Date;
    price: number;
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

export type Guest = {
    id: string;
    name: string;
    phone: string;
    email: string;
    idProof: string;
    address: string;
    bookingHistory: string[];
};

export type TotalBill = {
    room: string;
    restaurant: number;
};

type DataContextType = {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  halls: Hall[];
  setHalls: React.Dispatch<React.SetStateAction<Hall[]>>;
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
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  totalBill: TotalBill[];
  setTotalBill: React.Dispatch<React.SetStateAction<TotalBill[]>>;
  loading: boolean;
};

const initialRooms: Room[] = [];

const initialHalls: Hall[] = [
    {
        id: 'hall-1',
        name: 'Grand Ballroom',
        capacity: 200,
        facilities: ['Projector', 'Sound System', 'AC'],
        price: 10000,
        status: 'Available',
    },
    {
        id: 'hall-2',
        name: 'Conference Room A',
        capacity: 50,
        facilities: ['Whiteboard', 'Projector', 'AC'],
        price: 5000,
        status: 'Booked',
        customerName: 'Tech Corp',
        contact: '9876543210',
        purpose: 'Quarterly Meeting',
        checkIn: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        checkOut: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        totalPrice: 5000,
    },
    {
        id: 'hall-3',
        name: 'Meeting Room B',
        capacity: 20,
        facilities: ['TV', 'AC'],
        price: 2500,
        status: 'Maintenance',
    },
];

const initialMenuItems: MenuItem[] = [
    // Starters
    { name: 'Chicken 65', category: 'Starters', price: 250, status: 'Available' },
    { name: 'Paneer Tikka', category: 'Starters', price: 220, status: 'Available' },
    { name: 'Gobi Manchurian', category: 'Starters', price: 180, status: 'Available' },
    { name: 'Fish Finger', category: 'Starters', price: 280, status: 'Available' },
    { name: 'Spring Rolls', category: 'Starters', price: 160, status: 'Available' },
  
    // Main Course – Indian
    { name: 'Butter Chicken with Naan', category: 'Main Course – Indian', price: 450, status: 'Available' },
    { name: 'Paneer Butter Masala', category: 'Main Course – Indian', price: 380, status: 'Available' },
    { name: 'Mutton Rogan Josh', category: 'Main Course – Indian', price: 550, status: 'Available' },
    { name: 'Vegetable Biryani', category: 'Main Course – Indian', price: 320, status: 'Available' },
    { name: 'Egg Curry with Rice', category: 'Main Course – Indian', price: 280, status: 'Available' },
  
    // South Indian Specials
    { name: 'Chettinad Chicken Curry', category: 'South Indian Specials', price: 420, status: 'Available' },
    { name: 'Fish Kuzhambu', category: 'South Indian Specials', price: 390, status: 'Available' },
    { name: 'Prawn Masala', category: 'South Indian Specials', price: 480, status: 'Available' },
    { name: 'Veg Kurma with Appam', category: 'South Indian Specials', price: 280, status: 'Available' },
    { name: 'Sambar, Rasam, Poriyal set', category: 'South Indian Specials', price: 250, status: 'Available' },
  
    // Continental / Hi-Fi
    { name: 'Grilled Chicken with Pepper Sauce', category: 'Continental / Hi-Fi', price: 520, status: 'Available' },
    { name: 'Pasta Alfredo / Arrabbiata', category: 'Continental / Hi-Fi', price: 450, status: 'Available' },
    { name: 'Stuffed Mushroom with Cheese', category: 'Continental / Hi-Fi', price: 380, status: 'Available' },
    { name: 'BBQ Chicken Pizza', category: 'Continental / Hi-Fi', price: 550, status: 'Available' },
    { name: 'Caesar Salad', category: 'Continental / Hi-Fi', price: 320, status: 'Available' },
  
    // Desserts
    { name: 'Gulab Jamun', category: 'Desserts', price: 120, status: 'Available' },
    { name: 'Chocolate Brownie with Ice Cream', category: 'Desserts', price: 180, status: 'Available' },
    { name: 'Rasmalai', category: 'Desserts', price: 150, status: 'Available' },
    { name: 'Cheesecake', category: 'Desserts', price: 200, status: 'Available' },
    { name: 'Payasam', category: 'Desserts', price: 100, status: 'Available' },
  
    // Beverages
    { name: 'Fresh Juices', category: 'Beverages', price: 150, status: 'Available' },
    { name: 'Mocktails (Virgin Mojito, Blue Lagoon)', category: 'Beverages', price: 180, status: 'Available' },
    { name: 'Filter Coffee', category: 'Beverages', price: 80, status: 'Available' },
    { name: 'Milkshakes', category: 'Beverages', price: 160, status: 'Available' },
    { name: 'Soft Drinks', category: 'Beverages', price: 60, status: 'Available' },
];

const initialActiveOrders: ActiveOrder[] = [
    {
      id: 'ORD001',
      status: 'preparing',
      table: 5,
      items: 'Grilled Salmon, Caesar Salad',
      time: new Date(Date.now() - 15 * 60 * 1000),
      price: 40,
    },
    {
      id: 'ORD002',
      status: 'pending',
      table: 12,
      items: 'Ribeye Steak, Chocolate Mousse',
      time: new Date(Date.now() - 5 * 60 * 1000),
      price: 54,
    },
    {
      id: 'ORD003',
      status: 'ready',
      table: 3,
      items: 'Caesar Salad, Chocolate Mousse',
      time: new Date(Date.now() - 25 * 60 * 1000),
      price: 21,
    },
];

const initialInventoryItems: InventoryItem[] = [
    { name: 'Premium Whiskey', type: 'Whiskey', stock: 24, price: 15, status: 'good' },
    { name: 'Classic Scotch', type: 'Whiskey', stock: 18, price: 20, status: 'low' },
    { name: 'Single Malt Reserve', type: 'Whiskey', stock: 12, price: 28, status: 'low' },
    { name: 'Bourbon Select', type: 'Whiskey', stock: 15, price: 22, status: 'low' },
    { name: 'Irish Whiskey', type: 'Whiskey', stock: 10, price: 25, status: 'low' },
    { name: 'Blended Gold', type: 'Whiskey', stock: 20, price: 18, status: 'good' },
    { name: 'Vodka Premium', type: 'Vodka', stock: 8, price: 12, status: 'critical' },
    { name: 'Classic Vodka', type: 'Vodka', stock: 14, price: 15, status: 'low' },
    { name: 'Flavoured Vodka (Citrus)', type: 'Vodka', stock: 10, price: 18, status: 'low' },
    { name: 'Ultra Smooth Vodka', type: 'Vodka', stock: 6, price: 25, status: 'critical' },
    { name: 'Russian Vodka', type: 'Vodka', stock: 12, price: 20, status: 'low' },
    { name: 'Ice Crystal Vodka', type: 'Vodka', stock: 9, price: 16, status: 'critical' },
    { name: 'Craft Beer', type: 'Beer', stock: 48, price: 6, status: 'good' },
    { name: 'Lager Premium', type: 'Beer', stock: 40, price: 7, status: 'good' },
    { name: 'Wheat Beer', type: 'Beer', stock: 35, price: 8, status: 'good' },
    { name: 'Dark Stout', type: 'Beer', stock: 20, price: 10, status: 'good' },
    { name: 'Pilsner Select', type: 'Beer', stock: 30, price: 9, status: 'good' },
    { name: 'Premium Ale', type: 'Beer', stock: 25, price: 11, status: 'good' },
    { name: 'Red Wine', type: 'Wine', stock: 16, price: 25, status: 'low' },
    { name: 'White Wine', type: 'Wine', stock: 12, price: 20, status: 'low' },
    { name: 'Rosé Wine', type: 'Wine', stock: 10, price: 22, status: 'low' },
    { name: 'Sparkling Wine', type: 'Wine', stock: 14, price: 28, status: 'low' },
    { name: 'Dessert Wine', type: 'Wine', stock: 8, price: 30, status: 'critical' },
    { name: 'Vintage Reserve', type: 'Wine', stock: 6, price: 40, status: 'critical' },
    { name: 'Gin Tonic', type: 'Gin', stock: 5, price: 10, status: 'critical' },
    { name: 'Dry Gin', type: 'Gin', stock: 8, price: 12, status: 'critical' },
    { name: 'London Dry Gin', type: 'Gin', stock: 10, price: 15, status: 'low' },
    { name: 'Premium Herbal Gin', type: 'Gin', stock: 6, price: 18, status: 'critical' },
    { name: 'Spiced Gin', type: 'Gin', stock: 7, price: 16, status: 'critical' },
    { name: 'Classic Botanical Gin', type: 'Gin', stock: 9, price: 20, status: 'critical' },
    { name: 'Champagne', type: 'Champagne', stock: 12, price: 40, status: 'low' },
    { name: 'Brut Champagne', type: 'Champagne', stock: 10, price: 45, status: 'low' },
    { name: 'Rosé Champagne', type: 'Champagne', stock: 8, price: 50, status: 'critical' },
    { name: 'Vintage Champagne', type: 'Champagne', stock: 6, price: 60, status: 'critical' },
    { name: 'Prestige Cuvée', type: 'Champagne', stock: 4, price: 75, status: 'critical' },
    { name: 'Sparkling Rosé', type: 'Champagne', stock: 9, price: 55, status: 'critical' },
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

const initialGuests: Guest[] = [
    {
        id: 'guest-1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-202-555-0104',
        address: '123 Main St, Anytown USA',
        idProof: 'Passport A1234567',
        bookingHistory: ['Room 101 - 2024-01-10 to 2024-01-12']
    },
    {
        id: 'guest-2',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+44 20 7946 0958',
        address: '456 Oak Ave, Anytown USA',
        idProof: 'DL B1234567',
        bookingHistory: ['Room 201 - 2024-01-09 to 2024-01-11']
    }
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
  halls: [],
  setHalls: () => {},
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
  guests: [],
  setGuests: () => {},
  totalBill: [],
  setTotalBill: () => {},
  loading: true,
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [totalBill, setTotalBill] = useState<TotalBill[]>(initialTotalBill);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, hallsRes, menuItemsRes, ordersRes, barProductsRes, barSalesRes, stockItemsRes] = await Promise.all([
                getRooms(),
                getHalls(),
                getRestaurantMenuItems(),
                getOrders(),
                getBarProducts(),
                getBarSales(),
                getStockItems(),
            ]);

            if (roomsRes.success) {
                const fetchedRooms = roomsRes.rooms.filter((room: any): room is Room => !!room.number);
                setRooms(fetchedRooms.length > 0 ? fetchedRooms.sort((a:Room,b:Room) => a.number.localeCompare(b.number)) : initialRooms);
            }

            if (hallsRes.success) {
                const fetchedHalls = hallsRes.halls;
                setHalls(fetchedHalls.length > 0 ? fetchedHalls.sort((a:Hall, b:Hall) => a.name.localeCompare(b.name)) : initialHalls);
            }

            if (menuItemsRes.success) {
                setMenuItems(menuItemsRes.items.length > 0 ? menuItemsRes.items.sort((a:MenuItem,b:MenuItem) => a.name.localeCompare(b.name)) : initialMenuItems);
            }

            if (ordersRes.success) {
                const formattedOrders = ordersRes.orders.map((order: any) => ({
                    ...order,
                    status: 'pending', // You might want to store status in DB
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
                setInventoryItems(formattedBarProducts.length > 0 ? formattedBarProducts.sort((a:InventoryItem,b:InventoryItem) => a.name.localeCompare(b.name)) : initialInventoryItems);
            }

            if (barSalesRes.success) {
                setRecentSales(barSalesRes.sales.length > 0 ? barSalesRes.sales.sort((a: RecentSale, b: RecentSale) => new Date(b.time).getTime() - new Date(a.time).getTime()) : initialRecentSales);
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
                setStockItems(formattedStockItems.length > 0 ? formattedStockItems.sort((a:StockItem,b:StockItem) => a.name.localeCompare(b.name)) : initialStockItems);
            }

            
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            // Fallback to initial data if fetch fails
            setRooms(initialRooms);
            setHalls(initialHalls);
            setMenuItems(initialMenuItems);
            setActiveOrders(initialActiveOrders);
            setInventoryItems(initialInventoryItems);
            setRecentSales(initialRecentSales);
            setStockItems(initialStockItems);
            setGuests(initialGuests);
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
        halls,
        setHalls,
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
        guests,
        setGuests,
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
