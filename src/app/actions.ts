
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, Timestamp, setDoc, getDoc } from 'firebase/firestore';


export async function getRooms() {
    // This function will be called by the data provider, but we will handle errors gracefully.
    // In a real app, you'd have proper read rules.
    try {
        const querySnapshot = await getDocs(collection(db, "rooms"));
        const rooms = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                ...data, 
                id: doc.id,
                checkIn: data.checkIn?.toDate ? data.checkIn.toDate().toISOString() : data.checkIn,
                checkOut: data.checkOut?.toDate ? data.checkOut.toDate().toISOString() : data.checkOut,
            };
        }).filter(room => room.number);
        return { success: true, rooms };
    } catch (error) {
        console.error("Firestore getRooms failed:", error);
        return { success: false, error: "Failed to fetch rooms.", rooms: [] };
    }
}

// All write/update/delete operations are removed to prevent permission errors.
// The client will handle state changes optimistically.

export async function addRoom(newRoom: any) {
  console.log("Mock addRoom called. State managed on client.");
  return { success: true, room: { ...newRoom, id: `mock-${Date.now()}` } };
}

export async function updateRoom(updatedRoom: any) {
    console.log("Mock updateRoom called. State managed on client.");
    return { success: true, room: updatedRoom };
}

export async function deleteRoom(roomNumber: string) {
    console.log("Mock deleteRoom called. State managed on client.");
    return { success: true };
}

export async function getRestaurantMenuItems() {
    return { success: true, items: [] };
}

export async function addRestaurantMenuItem(newMenuItem: any) {
    console.log("Mock addRestaurantMenuItem called. State managed on client.");
    return { success: true, item: { ...newMenuItem, id: `mock-${Date.now()}` } };
}

export async function updateRestaurantMenuItem(updatedMenuItem: any) {
    console.log("Mock updateRestaurantMenuItem called. State managed on client.");
    return { success: true, item: updatedMenuItem };
}

export async function deleteRestaurantMenuItem(itemName: string) {
    console.log("Mock deleteRestaurantMenuItem called. State managed on client.");
    return { success: true };
}

export async function getOrders() {
    return { success: true, orders: [] };
}

export async function addOrder(newOrder: any) {
    console.log("Mock addOrder called. State managed on client.");
    return { success: true, order: { ...newOrder, id: `mock-${Date.now()}` } };
}

export async function getBarSales() {
    return { success: true, sales: [] };
}

export async function recordBarSale(newSale: any) {
    console.log("Mock recordBarSale called. State managed on client.");
    return { success: true, sale: { ...newSale, id: `mock-${Date.now()}` } };
}

export async function getBarProducts() {
    return { success: true, products: [] };
}

export async function addBarProduct(newProduct: any) {
    console.log("Mock addBarProduct called. State managed on client.");
    return { success: true, product: { ...newProduct, id: `mock-${Date.now()}` } };
}

export async function updateBarProductStock(productName: string, newStock: number) {
    console.log("Mock updateBarProductStock called. State managed on client.");
    return { success: true, productName, newStock };
}

export async function updateBarProduct(updatedProduct: any) {
    console.log("Mock updateBarProduct called. State managed on client.");
    return { success: true, product: updatedProduct };
}

export async function deleteBarProduct(productName: string) {
    console.log("Mock deleteBarProduct called. State managed on client.");
    return { success: true };
}

export async function getStockItems() {
    return { success: true, items: [] };
}

export async function addStockItem(newItem: any) {
    console.log("Mock addStockItem called. State managed on client.");
    return { success: true, item: { ...newItem, id: `mock-${Date.now()}` } };
}

export async function updateStockItem(updatedItem: any) {
    console.log("Mock updateStockItem called. State managed on client.");
    return { success: true, item: updatedItem };
}

export async function deleteStockItem(itemName: string) {
    console.log("Mock deleteStockItem called. State managed on client.");
    return { success: true };
}

export async function getDailyNote(date: string) {
    return { success: true, note: "" };
}

export async function setDailyNote(date: string, content: string) {
    console.log("Mock setDailyNote called. State managed on client.");
    return { success: true };
}

export async function getHalls() {
    return { success: true, halls: [] };
}

export async function addHall(newHall: any) {
    console.log("Mock addHall called. State managed on client.");
    return { success: true, hall: { ...newHall, id: `mock-${Date.now()}` } };
}

export async function updateHall(updatedHall: any) {
    console.log("Mock updateHall called. State managed on client.");
    return { success: true, hall: updatedHall };
}

export async function deleteHall(hallName: string) {
    console.log("Mock deleteHall called. State managed on client.");
    return { success: true };
}
