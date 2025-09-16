
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export async function getRooms() {
    const querySnapshot = await getDocs(collection(db, "rooms"));
    const rooms = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return { success: true, rooms };
}

export async function addRoom(newRoom: {
  number: string;
  type: string;
  price: number;
  status: string;
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "rooms"), newRoom);
    return { success: true, room: { ...newRoom, id: docRef.id } };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: "Failed to add room" };
  }
}

export async function updateRoom(updatedRoom: {
  originalNumber: string;
  number: string;
  type: string;
  price: number;
  status: string;
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}) {
    try {
        const q = query(collection(db, "rooms"), where("number", "==", updatedRoom.originalNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const { originalNumber, ...roomData } = updatedRoom;
            await updateDoc(doc(db, "rooms", docId), roomData);
            return { success: true, room: updatedRoom };
        }
        return { success: false, error: "Room not found" };
    } catch (e) {
        console.error("Error updating document: ", e);
        return { success: false, error: "Failed to update room" };
    }
}

export async function deleteRoom(roomNumber: string) {
    try {
        const q = query(collection(db, "rooms"), where("number", "==", roomNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "rooms", docId));
            return { success: true };
        }
        return { success: false, error: "Room not found" };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: "Failed to delete room" };
    }
}

export async function getMenuItems() {
    const querySnapshot = await getDocs(collection(db, "menuItems"));
    const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return { success: true, items };
}

export async function addMenuItem(newMenuItem: {
  name: string;
  category: string;
  price: number;
  status: string;
}) {
    try {
        const docRef = await addDoc(collection(db, "menuItems"), newMenuItem);
        return { success: true, item: { ...newMenuItem, id: docRef.id } };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to add menu item" };
    }
}

export async function updateMenuItem(updatedMenuItem: {
  originalName: string;
  name: string;
  category: string;
  price: number;
  status: string;
}) {
    try {
        const q = query(collection(db, "menuItems"), where("name", "==", updatedMenuItem.originalName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const { originalName, ...itemData } = updatedMenuItem;
            await updateDoc(doc(db, "menuItems", docId), itemData);
            return { success: true, item: updatedMenuItem };
        }
        return { success: false, error: "Menu item not found" };
    } catch (e) {
        console.error("Error updating document: ", e);
        return { success: false, error: "Failed to update menu item" };
    }
}

export async function deleteMenuItem(itemName: string) {
    try {
        const q = query(collection(db, "menuItems"), where("name", "==", itemName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "menuItems", docId));
            return { success: true };
        }
        return { success: false, error: "Stock item not found" };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: "Failed to delete menu item" };
    }
}

export async function getOrders() {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const orders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, time: doc.data().time.toDate() }));
    return { success: true, orders };
}

export async function addOrder(newOrder: {
  table: number;
  items: string;
  price: number;
}) {
    try {
        const docRef = await addDoc(collection(db, "orders"), { ...newOrder, time: new Date() });
        return { success: true, order: { ...newOrder, id: docRef.id } };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to add order" };
    }
}

export async function getBarSales() {
    const querySnapshot = await getDocs(collection(db, "barSales"));
    const sales = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, time: doc.data().time.toDate() }));
    return { success: true, sales };
}

export async function recordBarSale(newSale: {
  name: string;
  qty: number;
  price: number;
  room?: string;
}) {
    try {
        const docRef = await addDoc(collection(db, "barSales"), { ...newSale, time: new Date() });
        return { success: true, sale: { ...newSale, id: docRef.id } };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to record bar sale" };
    }
}

export async function getBarProducts() {
    const querySnapshot = await getDocs(collection(db, "barProducts"));
    const products = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return { success: true, products };
}

export async function addBarProduct(newProduct: {
  name: string;
  type: string;
  price: number;
  stock: number;
}) {
    try {
        const docRef = await addDoc(collection(db, "barProducts"), newProduct);
        return { success: true, product: { ...newProduct, id: docRef.id } };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to add bar product" };
    }
}


export async function updateBarProductStock(productName: string, newStock: number) {
    try {
        const q = query(collection(db, "barProducts"), where("name", "==", productName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, "barProducts", docId), { stock: newStock });
            return { success: true, productName, newStock };
        }
        return { success: false, error: "Product not found" };
    } catch (e) {
        console.error("Error updating document: ", e);
        return { success: false, error: "Failed to update product stock" };
    }
}

export async function getStockItems() {
    const querySnapshot = await getDocs(collection(db, "stockItems"));
    const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return { success: true, items };
}

export async function addStockItem(newItem: {
  name: string;
  category: string;
  current: number;
  min: number;
  max: number;
  unit: string;
  supplier: string;
}) {
    try {
        const docRef = await addDoc(collection(db, "stockItems"), newItem);
        return { success: true, item: { ...newItem, id: docRef.id } };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to add stock item" };
    }
}

export async function updateStockItem(updatedItem: {
  originalName: string;
  name: string;
  category: string;
  current: number;
  min: number;
  max: number;
  unit: string;
  supplier: string;
}) {
    try {
        const q = query(collection(db, "stockItems"), where("name", "==", updatedItem.originalName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const { originalName, ...itemData } = updatedItem;
            await updateDoc(doc(db, "stockItems", docId), itemData);
            return { success: true, item: updatedItem };
        }
        return { success: false, error: "Stock item not found" };
    } catch (e) {
        console.error("Error updating document: ", e);
        return { success: false, error: "Failed to update stock item" };
    }
}

export async function deleteStockItem(itemName: string) {
    try {
        const q = query(collection(db, "stockItems"), where("name", "==", itemName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "stockItems", docId));
            return { success: true };
        }
        return { success: false, error: "Stock item not found" };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: "Failed to delete stock item" };
    }
}
    

    
