
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
  const roomData: any = { ...newRoom };
  if (newRoom.checkIn) roomData.checkIn = Timestamp.fromDate(new Date(newRoom.checkIn));
  if (newRoom.checkOut) roomData.checkOut = Timestamp.fromDate(new Date(newRoom.checkOut));

  const collectionRef = collection(db, "rooms");
  
  const docRef = await addDoc(collectionRef, roomData);
  const resultRoom = { 
      ...newRoom, 
      id: docRef.id,
      checkIn: newRoom.checkIn,
      checkOut: newRoom.checkOut
  };
  return { success: true, room: resultRoom };
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
  facilities?: string[];
}) {
    const q = query(collection(db, "rooms"), where("number", "==", updatedRoom.originalNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Room not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "rooms", docId);
    const { originalNumber, ...roomData } = updatedRoom;

    const updateData: any = { ...roomData };
    if (roomData.checkIn) updateData.checkIn = Timestamp.fromDate(new Date(roomData.checkIn));
    if (roomData.checkOut) updateData.checkOut = Timestamp.fromDate(new Date(roomData.checkOut));

    await updateDoc(docRef, updateData);
    const resultRoom = { 
        ...updatedRoom,
        checkIn: updatedRoom.checkIn,
        checkOut: updatedRoom.checkOut
    };
    return { success: true, room: resultRoom };
}

export async function deleteRoom(roomNumber: string) {
    const q = query(collection(db, "rooms"), where("number", "==", roomNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Room not found" };
    }
    
    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "rooms", docId);
    
    await deleteDoc(docRef);
    return { success: true };
}

export async function getRestaurantMenuItems() {
    const querySnapshot = await getDocs(collection(db, "menuItems"));
    const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return { success: true, items };
}

export async function addRestaurantMenuItem(newMenuItem: {
  name: string;
  category: string;
  price: number;
  status: string;
}) {
    const collectionRef = collection(db, "menuItems");
    const docRef = await addDoc(collectionRef, newMenuItem);
    return { success: true, item: { ...newMenuItem, id: docRef.id } };
}

export async function updateRestaurantMenuItem(updatedMenuItem: {
  originalName: string;
  name: string;
  category: string;
  price: number;
  status: string;
}) {
    const q = query(collection(db, "menuItems"), where("name", "==", updatedMenuItem.originalName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Menu item not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "menuItems", docId);
    const { originalName, ...itemData } = updatedMenuItem;
    
    await updateDoc(docRef, itemData);
    return { success: true, item: updatedMenuItem };
}

export async function deleteRestaurantMenuItem(itemName: string) {
    const q = query(collection(db, "menuItems"), where("name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Stock item not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "menuItems", docId);
    
    await deleteDoc(docRef);
    return { success: true };
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
    const orderData = { ...newOrder, time: new Date() };
    const collectionRef = collection(db, "orders");
    const docRef = await addDoc(collectionRef, orderData);
    return { success: true, order: { ...newOrder, id: docRef.id } };
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
    const saleData = { ...newSale, time: new Date() };
    const collectionRef = collection(db, "barSales");
    const docRef = await addDoc(collectionRef, saleData);
    return { success: true, sale: { ...newSale, id: docRef.id } };
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
    const collectionRef = collection(db, "barProducts");
    const docRef = await addDoc(collectionRef, newProduct);
    return { success: true, product: { ...newProduct, id: docRef.id } };
}

export async function updateBarProductStock(productName: string, newStock: number) {
    const q = query(collection(db, "barProducts"), where("name", "==", productName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Product not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "barProducts", docId);
    const updateData = { stock: newStock };

    await updateDoc(docRef, updateData);
    return { success: true, productName, newStock };
}

export async function updateBarProduct(updatedProduct: {
    originalName: string;
    name: string;
    type: string;
    price: number;
    stock: number;
}) {
    const q = query(collection(db, "barProducts"), where("name", "==", updatedProduct.originalName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return { success: false, error: "Product not found" };
    }
    
    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "barProducts", docId);
    const { originalName, ...productData } = updatedProduct;
    
    await updateDoc(docRef, productData);
    return { success: true, product: updatedProduct };
}

export async function deleteBarProduct(productName: string) {
    const q = query(collection(db, "barProducts"), where("name", "==", productName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Product not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "barProducts", docId);

    await deleteDoc(docRef);
    return { success: true };
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
    const collectionRef = collection(db, "stockItems");
    const docRef = await addDoc(collectionRef, newItem);
    return { success: true, item: { ...newItem, id: docRef.id } };
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
    const q = query(collection(db, "stockItems"), where("name", "==", updatedItem.originalName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Stock item not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "stockItems", docId);
    const { originalName, ...itemData } = updatedItem;

    await updateDoc(docRef, itemData);
    return { success: true, item: updatedItem };
}

export async function deleteStockItem(itemName: string) {
    const q = query(collection(db, "stockItems"), where("name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Stock item not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "stockItems", docId);

    await deleteDoc(docRef);
    return { success: true };
}

export async function getDailyNote(date: string) {
    const docRef = doc(db, "dailyNotes", date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { success: true, note: docSnap.data().content };
    }
    return { success: true, note: "" };
}

export async function setDailyNote(date: string, content: string) {
    const docRef = doc(db, "dailyNotes", date);
    const noteData = { content };
    await setDoc(docRef, noteData);
    return { success: true };
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
  const hallData: any = { ...newHall };
  if (newHall.checkIn) hallData.checkIn = Timestamp.fromDate(new Date(newHall.checkIn));
  if (newHall.checkOut) hallData.checkOut = Timestamp.fromDate(new Date(newHall.checkOut));

  const collectionRef = collection(db, "halls");

  const docRef = await addDoc(collectionRef, hallData);
  const resultHall = { 
      ...newHall, 
      id: docRef.id,
      checkIn: newHall.checkIn,
      checkOut: newHall.checkOut
  };
  return { success: true, hall: resultHall };
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
    addOns?: string[];
    foodCost?: number;
}) {
    const q = query(collection(db, "halls"), where("name", "==", updatedHall.originalName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Hall not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "halls", docId);
    const { originalName, ...hallData } = updatedHall;

    const updateData: any = { ...hallData };
    if (hallData.checkIn) updateData.checkIn = Timestamp.fromDate(new Date(hallData.checkIn));
    if (hallData.checkOut) updateData.checkOut = Timestamp.fromDate(new Date(hallData.checkOut));
    
    await updateDoc(docRef, updateData);
    const resultHall: any = { ...updatedHall };
    delete resultHall.originalName;
    return { success: true, hall: resultHall };
}

export async function deleteHall(hallName: string) {
    const q = query(collection(db, "halls"), where("name", "==", hallName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return { success: false, error: "Hall not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "halls", docId);

    await deleteDoc(docRef);
    return { success: true };
}
