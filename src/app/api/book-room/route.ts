
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, customerName, checkInDate, checkOutDate } = body;

    if (!roomId || !customerName || !checkInDate || !checkOutDate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newBooking = {
      roomId,
      customerName,
      checkInDate: Timestamp.fromDate(new Date(checkInDate)),
      checkOutDate: Timestamp.fromDate(new Date(checkOutDate)),
      status: 'confirmed',
    };

    const docRef = await addDoc(collection(db, 'bookings'), newBooking);

    return NextResponse.json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: { id: docRef.id, ...newBooking } 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
