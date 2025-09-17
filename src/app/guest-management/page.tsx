
import Topbar from '@/components/hotel-vista/topbar';
import GuestManagementDashboard from '@/components/hotel-vista/guest-management-client';

export default function GuestManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <GuestManagementDashboard />
      </main>
    </div>
  );
}
