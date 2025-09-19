
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            checkInDate: data.checkInDate?.toDate ? data.checkInDate.toDate().toISOString() : data.checkInDate,
            checkOutDate: data.checkOutDate?.toDate ? data.checkOutDate.toDate().toISOString() : data.checkOutDate,
        };
    });

    return NextResponse.json({ 
        success: true, 
        message: 'Bookings retrieved successfully',
        data: bookings 
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
