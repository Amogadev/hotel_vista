
'use client';

import React from 'react';
import { format } from 'date-fns';

type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

export type BarReceiptPrintProps = {
    billNo: string;
    date: Date;
    items: OrderItem[];
    total: number;
    room?: string;
};

export function BarReceiptPrint(props: BarReceiptPrintProps) {
    const { billNo, date, items, total, room } = props;
    return (
      <div className="p-8 font-mono text-xs text-black bg-white">
        <div className="text-center space-y-1">
          <h1 className="text-sm font-bold">HOTEL VISTA</h1>
          <h2 className="text-xs">Bar Receipt</h2>
        </div>

        <div className="flex justify-between my-4 border-t border-b border-dashed py-1">
            <div>
                <p>Bill No: {billNo}</p>
                {room && <p>Room: {room}</p>}
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
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="py-1">{item.name}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">₹{item.price.toFixed(2)}</td>
                <td className="text-right py-1">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t border-dashed pt-2">
            <div className="flex justify-end">
                <div className="w-48">
                     <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center mt-4 text-xs">
          <p>Thank you!</p>
        </div>
      </div>
    );
};
