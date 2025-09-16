import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import HotelVistaSidebar from '@/components/hotel-vista/sidebar';
import StockManagementDashboard from '@/components/hotel-vista/stock-management-client';

export default function StockManagementPage() {
  return (
    <SidebarProvider>
      <HotelVistaSidebar collapsible="icon" />
      <SidebarInset>
        <StockManagementDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
