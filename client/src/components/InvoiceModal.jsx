import React from 'react';
import { X, Printer, Download } from 'lucide-react';

const InvoiceModal = ({ orderId, isOpen, onClose }) => {
  if (!isOpen || !orderId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Toolbar */}
        <div className="bg-forest-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-forest-300" />
            <h3 className="font-bold text-sm sm:text-base">Official Tax Invoice - {orderId}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-forest-200 hover:text-white hover:bg-forest-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice View */}
        <div className="flex-1 bg-gray-100 p-2 sm:p-4 overflow-hidden">
          <iframe
            src={`/api/orders/${orderId}/invoice`}
            title={`Invoice ${orderId}`}
            className="w-full h-full bg-white rounded-lg border border-gray-300 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
