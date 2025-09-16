import HotelVistaSidebar from '@/components/hotel-vista/sidebar';
import Dashboard from '@/components/hotel-vista/dashboard-client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';

export default function HotelVistaPage() {
  return (
    <SidebarProvider defaultOpen={false}>
      <HotelVistaSidebar collapsible="icon" />
      <SidebarInset>
        <Dashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
