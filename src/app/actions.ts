
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  setDoc,
  getDoc,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

async function getCollectionData(collectionName: string) {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Timestamps to ISO strings
      Object.keys(data).forEach(key => {
        if (data[key] instanceof Timestamp) {
          data[key] = data[key].toDate().toISOString();
        }
      });
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error(`Firestore getCollectionData for ${collectionName} failed:`, error);
    // In a real app, you might want to throw the error or handle it differently
    return [];
  }
}

async function addDocument(collectionName: string, data: any) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
             const docData = docSnap.data();
             Object.keys(docData).forEach(key => {
                if (docData[key] instanceof Timestamp) {
                    docData[key] = docData[key].toDate().toISOString();
                }
             });
            return { success: true, doc: { ...docData, id: docSnap.id } };
        }
        return { success: false, error: 'Failed to retrieve added document.' };
    } catch(e) {
        console.error(`Failed to add document to ${collectionName}`, e)
        return { success: false, error: (e as Error).message };
    }
}

async function updateDocument(collectionName: string, docId: string, data: any) {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return { success: true };
    } catch (e) {
        console.error(`Failed to update document in ${collectionName}`, e);
        return { success: false, error: (e as Error).message };
    }
}

async function deleteDocumentByField(collectionName: string, fieldName: string, value: string) {
    try {
        const q = query(collection(db, collectionName), where(fieldName, "==", value));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docToDelete = querySnapshot.docs[0];
            await deleteDoc(doc(db, collectionName, docToDelete.id));
            return { success: true };
        }
        return { success: false, error: "Document not found" };
    } catch (e) {
        console.error(`Failed to delete document from ${collectionName}`, e);
        return { success: false, error: (e as Error).message };
    }
}

// Rooms
export async function getRooms() {
    const rooms = await getCollectionData('rooms');
    return { success: true, rooms };
}

export async function addRoom(newRoom: any) {
  const result = await addDocument('rooms', newRoom);
  return { ...result, room: result.doc };
}

export async function updateRoom({ originalNumber, ...updatedRoom }: any) {
  const q = query(collection(db, "rooms"), where("number", "==", originalNumber));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return { success: false, error: "Room not found" };
  }
  const docToUpdate = querySnapshot.docs[0];
  return updateDocument('rooms', docToUpdate.id, updatedRoom);
}

export async function deleteRoom(roomNumber: string) {
    return deleteDocumentByField('rooms', 'number', roomNumber);
}


// Restaurant Menu
export async function getRestaurantMenuItems() {
    const items = await getCollectionData('restaurantMenuItems');
    return { success: true, items };
}

export async function addRestaurantMenuItem(newMenuItem: any) {
    const result = await addDocument('restaurantMenuItems', newMenuItem);
    return { ...result, item: result.doc };
}

export async function updateRestaurantMenuItem({ originalName, ...updatedMenuItem }: any) {
    const q = query(collection(db, "restaurantMenuItems"), where("name", "==", originalName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return { success: false, error: "Menu item not found" };
    }
    const docToUpdate = querySnapshot.docs[0];
    return updateDocument('restaurantMenuItems', docToUpdate.id, updatedMenuItem);
}

export async function deleteRestaurantMenuItem(itemName: string) {
    return deleteDocumentByField('restaurantMenuItems', 'name', itemName);
}

// Restaurant Orders
export async function getOrders() {
    const orders = await getCollectionData('orders');
    return { success: true, orders };
}

export async function addOrder(newOrder: any) {
    const result = await addDocument('orders', { ...newOrder, time: Timestamp.now() });
    return { ...result, order: result.doc };
}

// Bar Sales
export async function getBarSales() {
    const sales = await getCollectionData('barSales');
    return { success: true, sales };
}

export async function recordBarSale(newSale: any) {
    const result = await addDocument('barSales', { ...newSale, time: Timestamp.now() });
    return { ...result, sale: result.doc };
}

// Bar Products
export async function getBarProducts() {
    const products = await getCollectionData('barProducts');
    return { success: true, products };
}

export async function addBarProduct(newProduct: any) {
    const result = await addDocument('barProducts', newProduct);
    return { ...result, product: result.doc };
}

export async function updateBarProductStock(productName: string, newStock: number) {
    const q = query(collection(db, "barProducts"), where("name", "==", productName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return { success: false, error: "Product not found" };
    }
    const docToUpdate = querySnapshot.docs[0];
    return updateDocument('barProducts', docToUpdate.id, { stock: newStock });
}

export async function updateBarProduct({ originalName, ...updatedProduct }: any) {
    const q = query(collection(db, "barProducts"), where("name", "==", originalName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return { success: false, error: "Product not found" };
    }
    const docToUpdate = querySnapshot.docs[0];
    return updateDocument('barProducts', docToUpdate.id, updatedProduct);
}

export async function deleteBarProduct(productName: string) {
    return deleteDocumentByField('barProducts', 'name', productName);
}

// Stock Items
export async function getStockItems() {
    const items = await getCollectionData('stockItems');
    return { success: true, items };
}

export async function addStockItem(newItem: any) {
    const result = await addDocument('stockItems', newItem);
    return { ...result, item: result.doc };
}

export async function updateStockItem({ originalName, ...updatedItem }: any) {
    const q = query(collection(db, "stockItems"), where("name", "==", originalName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return { success: false, error: "Stock item not found" };
    }
    const docToUpdate = querySnapshot.docs[0];
    return updateDocument('stockItems', docToUpdate.id, updatedItem);
}

export async function deleteStockItem(itemName: string) {
    return deleteDocumentByField('stockItems', 'name', itemName);
}

// Daily Notes
export async function getDailyNote(date: string) {
    try {
        const docRef = doc(db, 'dailyNotes', date);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, note: docSnap.data().content };
        }
        return { success: true, note: "" };
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

export async function setDailyNote(date: string, content: string) {
    try {
        const docRef = doc(db, 'dailyNotes', date);
        await setDoc(docRef, { content });
        return { success: true };
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

// Halls
export async function getHalls() {
    const halls = await getCollectionData('halls');
    return { success: true, halls };
}

export async function addHall(newHall: any) {
    const result = await addDocument('halls', newHall);
    return { ...result, hall: result.doc };
}

export async function updateHall({ originalName, ...updatedHall }: any) {
    const q = query(collection(db, "halls"), where("name", "==", originalName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        const result = await addDocument('halls', updatedHall);
        return {...result, hall: result.doc};
    }
    const docToUpdate = querySnapshot.docs[0];
    const updateResult = await updateDocument('halls', docToUpdate.id, updatedHall);
    return { ...updateResult, hall: { id: docToUpdate.id, ...updatedHall } };
}

export async function deleteHall(hallName: string) {
    return deleteDocumentByField('halls', 'name', hallName);
}
