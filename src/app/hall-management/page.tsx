import Topbar from '@/components/hotel-vista/topbar';

export default function HallManagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14 p-8">
        <h1 className="text-3xl font-bold">Hall Management</h1>
        <p className="text-muted-foreground">This is the Hall Management page.</p>
      </main>
    </div>
  );
}
