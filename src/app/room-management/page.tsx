import Topbar from '@/components/hotel-vista/topbar';
import RoomManagementDashboard from '@/components/hotel-vista/room-management-client';

export default function RoomManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-16">
        <RoomManagementDashboard />
      </main>
    </div>
  );
}
