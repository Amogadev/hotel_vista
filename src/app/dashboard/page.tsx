
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/hotel-vista/topbar';
import Dashboard from '@/components/hotel-vista/dashboard-client';

export default function DashboardPage() {
  
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <Dashboard />
      </main>
    </div>
  );
}
