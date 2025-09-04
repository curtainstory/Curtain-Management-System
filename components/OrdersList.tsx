
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';
import { OrderSummary, FullOrderDetails, TailoringItem } from '../types';
import InvoiceTemplate from './InvoiceTemplate';
import TailoringTemplate from './TailoringTemplate';

declare const jspdf: any;
declare const html2canvas: any;

interface OrdersListProps {
  showAlert: (message: string) => void;
}

type PdfDataType = {
  type: 'invoice';
  data: FullOrderDetails;
  orderId: number;
} | {
  type: 'tailoring';
  data: TailoringItem[];
  orderId: number;
} | null;

const OrdersList: React.FC<OrdersListProps> = ({ showAlert }) => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfData, setPdfData] = useState<PdfDataType>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      showAlert('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAlert]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleViewInvoice = async (orderId: number) => {
    const result = await apiService.getOrderSummary(orderId);
    if ('error' in result) {
      showAlert(result.error);
    } else {
      setPdfData({ type: 'invoice', data: result, orderId });
    }
  };

  const handleViewTailoring = async (orderId: number) => {
    const result = await apiService.getTailoringDetails(orderId);
    if ('error' in result) {
      showAlert(result.error);
    } else {
      setPdfData({ type: 'tailoring', data: result, orderId });
    }
  };

  useEffect(() => {
    if (pdfData && pdfTemplateRef.current) {
        setIsGenerating(true);
        const generatePdf = async () => {
            try {
                const element = pdfTemplateRef.current;
                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                
                const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const imgWidth = pdfWidth;
                const imgHeight = imgWidth / ratio;
                
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }
                
                pdf.save(`${pdfData.type}-${pdfData.orderId}.pdf`);
            } catch (error) {
                console.error("Error generating PDF:", error);
                showAlert("Could not generate PDF.");
            } finally {
                setPdfData(null);
                setIsGenerating(false);
            }
        };

        // Timeout to allow the off-screen component to render fully before capturing
        const timer = setTimeout(generatePdf, 300);
        return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfData]);


  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Saved Orders</h2>
      {isGenerating && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-lg font-medium text-gray-700">Generating PDF...</p>
              </div>
          </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 font-medium text-gray-600">Order #</th>
              <th className="p-3 font-medium text-gray-600">Date</th>
              <th className="p-3 font-medium text-gray-600">Customer</th>
              <th className="p-3 font-medium text-gray-600">Total Cost</th>
              <th className="p-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading orders...</td></tr>
            ) : orders.length > 0 ? orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold text-indigo-600">#{order.id}</td>
                <td className="p-3">{order.order_date}</td>
                <td className="p-3">{order.customer_name}</td>
                <td className="p-3">${order.total_cost.toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleViewInvoice(order.id)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition">Invoice PDF</button>
                    <button onClick={() => handleViewTailoring(order.id)} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition">Tailoring PDF</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="absolute -left-full top-0">
        {pdfData?.type === 'invoice' && <InvoiceTemplate ref={pdfTemplateRef} details={pdfData.data} />}
        {pdfData?.type === 'tailoring' && <TailoringTemplate ref={pdfTemplateRef} items={pdfData.data} orderId={pdfData.orderId} />}
      </div>
    </div>
  );
};

export default OrdersList;
