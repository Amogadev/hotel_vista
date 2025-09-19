
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/hotel-vista/topbar';
import RoomManagementDashboard from '@/components/hotel-vista/room-management-client';

export default function RoomManagementPage() {
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
      <main className="flex-1 pt-14">
        <RoomManagementDashboard />
      </main>
    </div>
  );
}
