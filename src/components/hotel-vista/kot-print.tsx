
import React from 'react';
import { format } from 'date-fns';

type OrderItem = {
    name: string;
    quantity: number;
};

export type KotPrintProps = {
    billNo: string;
    table: string;
    waiter: string;
    date: Date;
    items: OrderItem[];
};

export const KotPrint = React.forwardRef<HTMLDivElement, KotPrintProps>(
    ({ billNo, table, waiter, date, items }, ref) => {
    return (
      <div ref={ref} className="p-8 font-mono text-xs text-black bg-white">
        <div className="text-center space-y-1">
          <h1 className="text-sm font-bold">MAYILAI NILA MANAMAGIL</h1>
          <h2 className="text-sm font-bold">MANDRAM</h2>
          <p className="text-xs">KOT</p>
        </div>

        <div className="flex justify-between my-4 border-t border-b border-dashed py-1">
            <div>
                <p>Bill No: {billNo}</p>
                <p>Table: {table}</p>
                <p>Waiter: {waiter}</p>
            </div>
            <div className="text-right">
                <p>Date: {format(date, 'MM/dd/yyyy')}</p>
                <p>Time: {format(date, 'p')}</p>
            </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-dashed">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="py-1">{item.name}</td>
                <td className="text-right py-1">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center mt-4 text-xs">
          <p>This is not a bill</p>
        </div>
      </div>
    );
  }
);

KotPrint.displayName = 'KotPrint';

