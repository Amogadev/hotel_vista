import Topbar from '@/components/hotel-vista/topbar';
import HallManagementDashboard from '@/components/hotel-vista/hall-management-client';

export default function HallManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <HallManagementDashboard />
      </main>
    </div>
  );
}
