
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, Timestamp, setDoc, getDoc } from 'firebase/firestore';

export async function getRooms() {
    const querySnapshot = await getDocs(collection(db, "rooms"));
    const rooms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data, 
            id: doc.id,
            checkIn: data.checkIn?.toDate ? data.checkIn.toDate().toISOString() : data.checkIn,
            checkOut: data.checkOut?.toDate ? data.checkOut.toDate().toISOString() : data.checkOut,
        };
    }).filter(room => room.number); // Filter out rooms without a number
    return { success: true, rooms };
}

export async function addRoom(newRoom: {
  number: string;
  type: string;
  price: number;
  status: string;
  guest?: string;
  peopleCount?: number;
  idProof?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice?: number;
}) {
  try {
    const roomData: any = { ...newRoom };
    if (newRoom.checkIn) roomData.checkIn = Timestamp.fromDate(new Date(newRoom.checkIn));
    if (newRoom.checkOut) roomData.checkOut = Timestamp.fromDate(new Date(newRoom.checkOut));

    const docRef = await addDoc(collection(db, "rooms"), roomData);
    const resultRoom = { 
        ...newRoom, 
        id: docRef.id,
        checkIn: newRoom.checkIn,
        checkOut: newRoom.checkOut
    };
    return { success: true, room: resultRoom };
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
  peopleCount?: number;
  idProof?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice?: number;
}) {
    try {
        const q = query(collection(db, "rooms"), where("number", "==", updatedRoom.originalNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const { originalNumber, ...roomData } = updatedRoom;

            const updateData: any = { ...roomData };
            if (roomData.checkIn) updateData.checkIn = Timestamp.fromDate(new Date(roomData.checkIn));
            if (roomData.checkOut) updateData.checkOut = Timestamp.fromDate(new Date(roomData.checkOut));

            await updateDoc(doc(db, "rooms", docId), updateData);
            
            const resultRoom = { 
                ...updatedRoom,
                checkIn: updatedRoom.checkIn,
                checkOut: updatedRoom.checkOut
            };
            return { success: true, room: resultRoom };
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
    const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, time: data.time?.toDate ? data.time.toDate() : new Date() };
    });
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
    const sales = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, time: data.time?.toDate ? data.time.toDate() : new Date() }
    });
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

export async function updateBarProduct(updatedProduct: {
    originalName: string;
    name: string;
    type: string;
    price: number;
    stock: number;
}) {
    try {
        const q = query(collection(db, "barProducts"), where("name", "==", updatedProduct.originalName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const { originalName, ...productData } = updatedProduct;
            await updateDoc(doc(db, "barProducts", docId), productData);
            return { success: true, product: updatedProduct };
        }
        return { success: false, error: "Product not found" };
    } catch (e) {
        console.error("Error updating document: ", e);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteBarProduct(productName: string) {
    try {
        const q = query(collection(db, "barProducts"), where("name", "==", productName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "barProducts", docId));
            return { success: true };
        }
        return { success: false, error: "Product not found" };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: "Failed to delete product" };
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

export async function getDailyNote(date: string) {
    try {
        const docRef = doc(db, "dailyNotes", date);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, note: docSnap.data().content };
        }
        return { success: true, note: "" };
    } catch (e) {
        console.error("Error getting document: ", e);
        return { success: false, error: "Failed to get note" };
    }
}

export async function setDailyNote(date: string, content: string) {
    try {
        const docRef = doc(db, "dailyNotes", date);
        await setDoc(docRef, { content });
        return { success: true };
    } catch (e) {
        console.error("Error setting document: ", e);
        return { success: false, error: "Failed to set note" };
    }
}

export async function getHalls() {
    const querySnapshot = await getDocs(collection(db, "halls"));
    const halls = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data, 
            id: doc.id,
            checkIn: data.checkIn?.toDate ? data.checkIn.toDate().toISOString() : data.checkIn,
            checkOut: data.checkOut?.toDate ? data.checkOut.toDate().toISOString() : data.checkOut,
        };
    });
    return { success: true, halls };
}

export async function addHall(newHall: {
  name: string;
  capacity: number;
  facilities: string[];
  price: number;
  status: string;
  customerName?: string;
  contact?: string;
  purpose?: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice?: number;
  idProof?: string;
  email?: string;
}) {
  try {
    const hallData: any = { ...newHall };
    if (newHall.checkIn) hallData.checkIn = Timestamp.fromDate(new Date(newHall.checkIn));
    if (newHall.checkOut) hallData.checkOut = Timestamp.fromDate(new Date(newHall.checkOut));

    const docRef = await addDoc(collection(db, "halls"), hallData);
    const resultHall = { 
        ...newHall, 
        id: docRef.id,
        checkIn: newHall.checkIn,
        checkOut: newHall.checkOut
    };
    return { success: true, hall: resultHall };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: "Failed to add hall" };
  }
}

export async function updateHall(updatedHall: {
    originalName: string;
    name: string;
    capacity: number;
    facilities: string[];
    price: number;
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
    specialRequests?: string;
    addOns?: string[];
    foodCost?: number;
}) {
    try {
        const q = query(collection(db, "halls"), where("name", "==", updatedHall.originalName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const { originalName, ...hallData } = updatedHall;

            const updateData: any = { ...hallData };
            if (hallData.checkIn) updateData.checkIn = Timestamp.fromDate(new Date(hallData.checkIn));
            if (hallData.checkOut) updateData.checkOut = Timestamp.fromDate(new Date(hallData.checkOut));

            await updateDoc(doc(db, "halls", docId), updateData);
            
            return { success: true, hall: updatedHall };
        }
        return { success: false, error: "Hall not found" };
    } catch (e) {
        console.error("Error updating document: ", e);
        return { success: false, error: "Failed to update hall" };
    }
}

export async function deleteHall(hallName: string) {
    try {
        const q = query(collection(db, "halls"), where("name", "==", hallName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "halls", docId));
            return { success: true };
        }
        return { success: false, error: "Hall not found" };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: "Failed to delete hall" };
    }
}

    

    
