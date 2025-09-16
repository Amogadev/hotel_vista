import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import HotelVistaSidebar from '@/components/hotel-vista/sidebar';
import RestaurantManagementDashboard from '@/components/hotel-vista/restaurant-client';

export default function RestaurantManagementPage() {
  return (
    <SidebarProvider>
      <HotelVistaSidebar collapsible="icon" />
      <SidebarInset>
        <RestaurantManagementDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
