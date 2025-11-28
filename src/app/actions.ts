
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
  
  return addDoc(collectionRef, roomData)
    .then(docRef => {
        const resultRoom = { 
            ...newRoom, 
            id: docRef.id,
            checkIn: newRoom.checkIn,
            checkOut: newRoom.checkOut
        };
        return { success: true, room: resultRoom };
    })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'create',
        requestResourceData: roomData,
      });
      errorEmitter.emit('permission-error', permissionError);
      return { success: false, error: permissionError.message };
    });
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

    return updateDoc(docRef, updateData)
        .then(() => {
            const resultRoom = { 
                ...updatedRoom,
                checkIn: updatedRoom.checkIn,
                checkOut: updatedRoom.checkOut
            };
            return { success: true, room: resultRoom };
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
}

export async function deleteRoom(roomNumber: string) {
    const q = query(collection(db, "rooms"), where("number", "==", roomNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Room not found" };
    }
    
    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "rooms", docId);
    
    return deleteDoc(docRef)
        .then(() => ({ success: true }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    return addDoc(collectionRef, newMenuItem)
        .then(docRef => ({ success: true, item: { ...newMenuItem, id: docRef.id } }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: newMenuItem,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    
    return updateDoc(docRef, itemData)
        .then(() => ({ success: true, item: updatedMenuItem }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: itemData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
}

export async function deleteRestaurantMenuItem(itemName: string) {
    const q = query(collection(db, "menuItems"), where("name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Stock item not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "menuItems", docId);
    
    return deleteDoc(docRef)
        .then(() => ({ success: true }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    return addDoc(collectionRef, orderData)
        .then(docRef => ({ success: true, order: { ...newOrder, id: docRef.id } }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: orderData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    return addDoc(collectionRef, saleData)
        .then(docRef => ({ success: true, sale: { ...newSale, id: docRef.id } }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: saleData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    return addDoc(collectionRef, newProduct)
        .then(docRef => ({ success: true, product: { ...newProduct, id: docRef.id } }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: newProduct,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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

    return updateDoc(docRef, updateData)
        .then(() => ({ success: true, productName, newStock }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    
    return updateDoc(docRef, productData)
        .then(() => ({ success: true, product: updatedProduct }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: productData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
}

export async function deleteBarProduct(productName: string) {
    const q = query(collection(db, "barProducts"), where("name", "==", productName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Product not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "barProducts", docId);

    return deleteDoc(docRef)
        .then(() => ({ success: true }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
    return addDoc(collectionRef, newItem)
        .then(docRef => ({ success: true, item: { ...newItem, id: docRef.id } }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: newItem,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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

    return updateDoc(docRef, itemData)
        .then(() => ({ success: true, item: updatedItem }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: itemData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
}

export async function deleteStockItem(itemName: string) {
    const q = query(collection(db, "stockItems"), where("name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "Stock item not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "stockItems", docId);

    return deleteDoc(docRef)
        .then(() => ({ success: true }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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
        const error = e as Error;
        return { success: false, error: error.message };
    }
}

export async function setDailyNote(date: string, content: string) {
    const docRef = doc(db, "dailyNotes", date);
    const noteData = { content };
    return setDoc(docRef, noteData)
        .then(() => ({ success: true }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create', // or 'update' depending on logic
                requestResourceData: noteData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
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

  return addDoc(collectionRef, hallData)
    .then(docRef => {
        const resultHall = { 
            ...newHall, 
            id: docRef.id,
            checkIn: newHall.checkIn,
            checkOut: newHall.checkOut
        };
        return { success: true, hall: resultHall };
    })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: hallData,
        });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, error: permissionError.message };
    });
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
    
    return updateDoc(docRef, updateData)
        .then(() => {
            const resultHall: any = { ...updatedHall };
            delete resultHall.originalName;
            return { success: true, hall: resultHall };
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
}

export async function deleteHall(hallName: string) {
    const q = query(collection(db, "halls"), where("name", "==", hallName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return { success: false, error: "Hall not found" };
    }

    const docId = querySnapshot.docs[0].id;
    const docRef = doc(db, "halls", docId);

    return deleteDoc(docRef)
        .then(() => ({ success: true }))
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: permissionError.message };
        });
}
