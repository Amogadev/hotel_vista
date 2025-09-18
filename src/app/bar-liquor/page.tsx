import Topbar from '@/components/hotel-vista/topbar';
import BarPOS from '@/components/hotel-vista/bar-liquor-client';

export default function BarLiquorManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14 h-[calc(100vh-3.5rem)]">
        <BarPOS />
      </main>
    </div>
  );
}
