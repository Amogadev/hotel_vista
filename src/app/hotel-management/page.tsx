import Topbar from '@/components/hotel-vista/topbar';

export default function HotelManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14 p-8">
        <h1 className="text-3xl font-bold">Hotel Management</h1>
        <p className="text-muted-foreground">This is the Hotel Management page.</p>
      </main>
    </div>
  );
}
