
import React, { forwardRef } from 'react';
import { FullOrderDetails } from '../types';

interface InvoiceTemplateProps {
  details: FullOrderDetails;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ details }, ref) => {
  const { order, customer, items } = details;
  return (
    <div ref={ref} className="bg-white text-black p-8" style={{ width: '210mm', fontFamily: 'sans-serif' }}>
      <header className="flex justify-between items-center pb-4 border-b-2 border-gray-800">
        <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
        <div className="text-right">
          <h2 className="text-xl font-semibold">Curtain Shop</h2>
          <p className="text-sm">123 Fabric Lane, Textile City</p>
        </div>
      </header>
      <main className="mt-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Billed To</h3>
            <p className="font-bold text-lg">{customer.name}</p>
            <p>{customer.address}</p>
            <p>{customer.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Invoice Details</h3>
            <p><span className="font-semibold">Invoice #:</span> {order.id}</p>
            <p><span className="font-semibold">Date:</span> {order.order_date}</p>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-sm font-semibold uppercase">Fabric (Design)</th>
              <th className="p-3 text-sm font-semibold uppercase">Type</th>
              <th className="p-3 text-sm font-semibold uppercase text-right">Length (cm)</th>
              <th className="p-3 text-sm font-semibold uppercase text-right">Qty</th>
              <th className="p-3 text-sm font-semibold uppercase text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{`${item.design_code} (${item.fabric_name})`}</td>
                <td className="p-3 capitalize">{item.item_type}</td>
                <td className="p-3 text-right">{item.length_cm.toFixed(2)}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">${item.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-8">
          <div className="w-1/3">
             <div className="flex justify-between items-center bg-gray-800 text-white p-3 rounded-md">
                <span className="text-xl font-bold">Total</span>
                <span className="text-xl font-bold">${order.total_cost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center text-gray-500 mt-16 pt-4 border-t">
        <p>Thank you for your business!</p>
      </footer>
    </div>
  );
});

export default InvoiceTemplate;
