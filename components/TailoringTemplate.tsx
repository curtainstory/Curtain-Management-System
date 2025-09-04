
import React, { forwardRef } from 'react';
import { TailoringItem } from '../types';

interface TailoringTemplateProps {
  items: TailoringItem[];
  orderId: number;
}

const TailoringTemplate = forwardRef<HTMLDivElement, TailoringTemplateProps>(({ items, orderId }, ref) => {
    const totalCurtains = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div ref={ref} className="bg-white text-black p-8" style={{ width: '210mm', fontFamily: 'sans-serif' }}>
        <header className="text-center pb-4 border-b-2 border-gray-800">
            <h1 className="text-3xl font-bold">Stitching Department Order</h1>
        </header>
        <main className="mt-8">
            <div className="grid grid-cols-3 gap-8 mb-8 text-center">
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">Order #</h3>
                    <p className="font-bold text-lg">{orderId}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">Date</h3>
                    <p className="font-bold text-lg">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Curtains</h3>
                    <p className="font-bold text-lg">{totalCurtains}</p>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-center">Curtain Items to be Stitched</h2>
            <table className="w-full text-left">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-3 text-sm font-semibold uppercase">Fabric (Design)</th>
                        <th className="p-3 text-sm font-semibold uppercase text-right">Stitching Length (cm)</th>
                        <th className="p-3 text-sm font-semibold uppercase text-right">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-3">{item.design_code}</td>
                            <td className="p-3 text-right">{item.length_cm.toFixed(2)}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
        <footer className="text-center text-gray-500 mt-16 pt-4 border-t">
            <p>Tailoring Details for Curtain Shop</p>
        </footer>
    </div>
  );
});

export default TailoringTemplate;
