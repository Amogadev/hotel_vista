
'use client';

import React, { createContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks/use-memo-firebase';

export type Transaction = {
    date: string;
    amount: number;
    method: string;
};

export type Room = {
    id: string;
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
    advanceAmount?: number;
    paidAmount?: number;
    transactions?: Transaction[];
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
    id: string;
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
    time: string; // ISO string
    price: number;
};

export type InventoryItem = {
    id: string;
    name: string;
    type: string;
    stock: number;
    price: number;
    status: 'good' | 'low' | 'critical';
};
  
export type RecentSale = {
    id: string;
    name: string;
    qty: number;
    room?: string;
    price: number;
    time: string; // ISO string
};

export type StockItem = {
    id: string;
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
  const firestore = useFirestore();

  // Firestore collections
  const roomsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'rooms') : null, [firestore]);
  const hallsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'halls') : null, [firestore]);
  const menuItemsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'restaurantMenuItems') : null, [firestore]);
  const inventoryItemsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'barProducts') : null, [firestore]);
  
  const { data: roomsData, isLoading: roomsLoading } = useCollection<Room>(roomsQuery);
  const { data: hallsData, isLoading: hallsLoading } = useCollection<Hall>(hallsQuery);
  const { data: menuItemsData, isLoading: menuItemsLoading } = useCollection<MenuItem>(menuItemsQuery);
  const { data: inventoryItemsData, isLoading: inventoryItemsLoading } = useCollection<InventoryItem>(inventoryItemsQuery);
  
  // Local state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [totalBill, setTotalBill] = useState<TotalBill[]>([]);

  useEffect(() => {
    if (roomsData) {
      const validRooms = roomsData.filter(room => room.number);
      setRooms(validRooms);
    }
  }, [roomsData]);

  useEffect(() => {
    if (hallsData) setHalls(hallsData);
  }, [hallsData]);

  useEffect(() => {
    if (menuItemsData) setMenuItems(menuItemsData);
  }, [menuItemsData]);

  useEffect(() => {
    if (inventoryItemsData) setInventoryItems(inventoryItemsData);
  }, [inventoryItemsData]);

  const loading = roomsLoading || hallsLoading || menuItemsLoading || inventoryItemsLoading;

  const value = {
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
  };

  return (
    <DataContext.Provider value={value}>
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
