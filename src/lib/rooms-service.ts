'use client';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { Room } from '@/context/data-provider';

// Note: These functions are for client-side use only.

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

export function addRoom(newRoom: Omit<Room, 'id'>) {
    if (!db) {
        console.error("Firestore is not initialized");
        return;
    }
    const roomData: any = { ...newRoom };
    if (newRoom.checkIn) roomData.checkIn = Timestamp.fromDate(new Date(newRoom.checkIn));
    if (newRoom.checkOut) roomData.checkOut = Timestamp.fromDate(new Date(newRoom.checkOut));

    const collectionRef = collection(db, "rooms");
    
    addDoc(collectionRef, roomData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: roomData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function updateRoom(updatedRoom: Room & { originalNumber: string }) {
    if (!db) {
        console.error("Firestore is not initialized");
        return;
    }
    const q = query(collection(db, "rooms"), where("number", "==", updatedRoom.originalNumber));
    
    getDocs(q).then(querySnapshot => {
        if (querySnapshot.empty) {
            console.error("Room not found for update");
            return;
        }

        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "rooms", docId);
        const { originalNumber, ...roomData } = updatedRoom;

        const updateData: any = { ...roomData };
        if (roomData.checkIn) updateData.checkIn = Timestamp.fromDate(new Date(roomData.checkIn));
        if (roomData.checkOut) updateData.checkOut = Timestamp.fromDate(new Date(roomData.checkOut));

        updateDoc(docRef, updateData).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: updateData
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    });
}

export function deleteRoom(roomNumber: string) {
     if (!db) {
        console.error("Firestore is not initialized");
        return;
    }
    const q = query(collection(db, "rooms"), where("number", "==", roomNumber));
    
    getDocs(q).then(querySnapshot => {
        if (querySnapshot.empty) {
            console.error("Room not found for deletion");
            return;
        }
        
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "rooms", docId);
        
        deleteDoc(docRef).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete'
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    });
}

export async function getDailyNote(date: string) {
    const docRef = doc(db, "dailyNotes", date);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, note: docSnap.data().content };
        }
        return { success: true, note: "" };
    } catch (e) {
        console.error("Error fetching daily note", e);
        return { success: false, error: (e as Error).message, note: "" };
    }
}

export function setDailyNote(date: string, content: string) {
    if (!db) {
        console.error("Firestore is not initialized");
        return;
    }
    const docRef = doc(db, "dailyNotes", date);
    const noteData = { content };
    setDoc(docRef, noteData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create', // or 'update'
            requestResourceData: noteData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
}