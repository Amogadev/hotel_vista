import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import HotelVistaSidebar from '@/components/hotel-vista/sidebar';
import RoomManagementDashboard from '@/components/hotel-vista/room-management-client';

export default function RoomManagementPage() {
  return (
    <SidebarProvider>
      <HotelVistaSidebar />
      <SidebarInset>
        <RoomManagementDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
