import Topbar from '@/components/hotel-vista/topbar';
import Dashboard from '@/components/hotel-vista/dashboard-client';

export default function HotelVistaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-16">
        <Dashboard />
      </main>
    </div>
  );
}
