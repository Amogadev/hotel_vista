
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { BedDouble, Printer } from 'lucide-react';
import type { Room } from '@/context/data-provider';

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  charges: {
    room: number;
    bar: number;
    restaurant: number;
    total: number;
  };
};

export function InvoiceModal({ isOpen, onClose, room, charges }: InvoiceModalProps) {
  
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
        printWindow.document.write('<html><head><title>Invoice</title>');
        const styles = Array.from(document.styleSheets)
            .map(s => `<link rel="stylesheet" href="${s.href}">`)
            .join('');
        printWindow.document.write(styles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div id="invoice-print-area">
          <DialogHeader className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BedDouble className="h-6 w-6 text-primary" />
              <DialogTitle className="text-2xl">HotelVista Invoice</DialogTitle>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-semibold">Billed to:</p>
                <p>{room.guest}</p>
                <p>Room {room.number}</p>
              </div>
              <div className="text-right">
                <p><span className="font-semibold">Invoice #:</span> INV{new Date().getTime()}</p>
                <p><span className="font-semibold">Date:</span> {format(new Date(), 'PPP')}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <Separator />
            <h3 className="font-semibold">Charges Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Room Charges ({room.type})</span>
                <span>₹{charges.room.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bar Charges</span>
                <span>₹{charges.bar.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant Charges</span>
                <span>₹{charges.restaurant.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Grand Total</span>
              <span>₹{charges.total.toFixed(2)}</span>
            </div>
            <Separator />
            <p className="text-center text-xs text-muted-foreground pt-4">Thank you for staying with us!</p>
          </div>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
