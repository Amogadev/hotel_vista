
'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/hotel-vista/topbar';
import Dashboard from '@/components/hotel-vista/dashboard-client';
import LoginPage from './login/page';
import { Loader2 } from 'lucide-react';

export default function HotelVistaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // This effect runs only on the client-side
    const userRole = localStorage.getItem('userRole');
    setIsAuthenticated(!!userRole);
  }, []);

  // While checking authentication status, show a loader to prevent flicker
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, render the login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If authenticated, render the main dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <Dashboard />
      </main>
    </div>
  );
}
