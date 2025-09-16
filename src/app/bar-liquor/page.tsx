import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import HotelVistaSidebar from '@/components/hotel-vista/sidebar';
import BarLiquorManagementDashboard from '@/components/hotel-vista/bar-liquor-client';

export default function BarLiquorManagementPage() {
  return (
    <SidebarProvider>
      <HotelVistaSidebar collapsible="icon" />
      <SidebarInset>
        <BarLiquorManagementDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
