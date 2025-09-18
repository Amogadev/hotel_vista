'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { getRooms, getMenuItems, getOrders, getBarProducts, getBarSales, getStockItems, getHalls } from '@/app/actions';
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
    totalPrice?: number;
    idProof?: string;
    email?: string;
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
      status: 'critical' as 'good' | 'low' | 'critical',
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
      status: 'low' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Gin Tonic',
      type: 'Gin',
      stock: 5,
      price: 10,
      status: 'critical' as 'good' | 'low' | 'critical',
    },
    {
      name: 'Champagne',
      type: 'Champagne',
      stock: 12,
      price: 40,
      status: 'low' as 'good' | 'low' | 'critical',
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
                getMenuItems(),
                getOrders(),
                getBarProducts(),
                getBarSales(),
                getStockItems(),
            ]);

            if (roomsRes.success) {
                const fetchedRooms = roomsRes.rooms.filter((room: any): room is Room => !!room.number);
                const formattedRooms = fetchedRooms.map((room: any) => {
                    const isCheckoutPast = room.checkOut && isPast(parseISO(room.checkOut));
                    const newStatus = room.status === 'Occupied' && isCheckoutPast ? 'Available' : room.status;

                    const cleanedRoom = {
                        ...room,
                        checkIn: room.checkIn ? format(parseISO(room.checkIn), 'yyyy-MM-dd') : undefined,
                        checkOut: room.checkOut ? format(parseISO(room.checkOut), 'yyyy-MM-dd') : undefined,
                        status: newStatus,
                    };

                    if (newStatus === 'Available') {
                        delete cleanedRoom.guest;
                        delete cleanedRoom.checkIn;
                        delete cleanedRoom.checkOut;
                        delete cleanedRoom.totalPrice;
                        delete cleanedRoom.peopleCount;
                        delete cleanedRoom.idProof;
                        delete cleanedRoom.email;
                    }
                    
                    return cleanedRoom;
                });
                setRooms(formattedRooms.length > 0 ? formattedRooms.sort((a:Room,b:Room) => a.number.localeCompare(b.number)) : initialRooms);
            }

            if (hallsRes.success) {
                const fetchedHalls = hallsRes.halls;
                 const formattedHalls = fetchedHalls.map((hall: any) => {
                    const isCheckoutPast = hall.checkOut && isPast(parseISO(hall.checkOut));
                    const newStatus = hall.status === 'Booked' && isCheckoutPast ? 'Available' : hall.status;

                     const cleanedHall = {
                        ...hall,
                        checkIn: hall.checkIn ? format(parseISO(hall.checkIn), 'yyyy-MM-dd') : undefined,
                        checkOut: hall.checkOut ? format(parseISO(hall.checkOut), 'yyyy-MM-dd') : undefined,
                        status: newStatus,
                    };

                     if (newStatus === 'Available') {
                        delete cleanedHall.customerName;
                        delete cleanedHall.contact;
                        delete cleanedHall.purpose;
                        delete cleanedHall.checkIn;
                        delete cleanedHall.checkOut;
                        delete cleanedHall.totalPrice;
                        delete cleanedHall.idProof;
                        delete cleanedHall.email;
                    }

                    return cleanedHall;
                });
                setHalls(formattedHalls.length > 0 ? formattedHalls.sort((a:Hall, b:Hall) => a.name.localeCompare(b.name)) : initialHalls);
            }

            if (menuItemsRes.success) {
                const formattedMenuItems = menuItemsRes.items.map((item: any) => ({
                    ...item,
                    price: `₹${item.price}`
                }));
                setMenuItems(formattedMenuItems.length > 0 ? formattedMenuItems.sort((a:MenuItem,b:MenuItem) => a.name.localeCompare(b.name)) : initialMenuItems);
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

    