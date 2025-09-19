
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/hotel-vista/topbar';
import RestaurantPOS from '@/components/hotel-vista/restaurant-pos';

export default function RestaurantManagementPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole');
      if (!userRole) {
        router.push('/login');
      }
    }
  }, [router]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14 h-[calc(100vh-3.5rem)]">
        <RestaurantPOS />
      </main>
    </div>
  );
}
