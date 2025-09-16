
import Topbar from '@/components/hotel-vista/topbar';
import CheckoutDashboard from '@/components/hotel-vista/checkout-client';

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 pt-14">
        <CheckoutDashboard />
      </main>
    </div>
  );
}
