import Topbar from '@/components/hotel-vista/topbar';
import RestaurantManagementDashboard from '@/components/hotel-vista/restaurant-client';

export default function RestaurantManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <RestaurantManagementDashboard />
      </main>
    </div>
  );
}
