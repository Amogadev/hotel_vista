import Topbar from '@/components/hotel-vista/topbar';
import StockManagementDashboard from '@/components/hotel-vista/stock-management-client';

export default function StockManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <StockManagementDashboard />
      </main>
    </div>
  );
}
