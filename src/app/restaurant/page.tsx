
import Topbar from '@/components/hotel-vista/topbar';
import RestaurantPOS from '@/components/hotel-vista/restaurant-pos';

export default function RestaurantManagementPage() {
  return (
    <div className="flex flex-col h-screen">
      <Topbar />
      <main className="flex-1 pt-14 overflow-hidden">
        <RestaurantPOS />
      </main>
    </div>
  );
}
