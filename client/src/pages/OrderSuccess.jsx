import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, ArrowRight, QrCode, FileText, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import UpiPaymentModal from '../components/UpiPaymentModal';
import InvoiceModal from '../components/InvoiceModal';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    // Fire celebratory eco-friendly confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#86efac', '#eab308']
    });
  }, []);

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4 p-8 bg-white rounded-3xl border border-gray-100">
        <Package className="w-12 h-12 text-forest-700 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-gray-900">Order Received</h2>
        <p className="text-xs text-gray-500">You can view your full order history in your account.</p>
        <Link to="/orders" className="inline-block px-5 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-forest-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl font-bold font-heading text-forest-950">
          Thank You, {order.deliveryAddress?.fullName}!
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Your Nursery Plants order has been queued for root-hydrated packaging at Nageswarreddy Plant Nursery. An order confirmation email has been dispatched to <strong>{order.customerEmail}</strong>.
        </p>

        <div className="p-4 bg-forest-50/70 rounded-2xl border border-forest-200 inline-block text-left text-xs space-y-1">
          <p>Order ID: <strong className="text-forest-950 text-sm">{order.orderId}</strong></p>
          <p>Total Payable: <strong>{formatCurrency(order.totalAmount)}</strong> via <strong>{order.paymentMethod}</strong></p>
          <p>Order Status: <strong className="text-forest-800">{order.orderStatus}</strong></p>
        </div>
      </div>

      {/* UPI Callout if applicable */}
      {order.paymentMethod === 'UPI' && order.paymentStatus !== 'VERIFIED' && (
        <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 border border-amber-200 text-amber-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base text-amber-950">
            <QrCode className="w-5 h-5 text-amber-700" />
            <span>UPI Payment Verification Required</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {order.paymentStatus === 'SUBMITTED' ? (
              <>We received your UTR (<strong>{order.upiDetails?.utr}</strong>). Our nursery desk is verifying it with our bank statement.</>
            ) : (
              <>You selected UPI Payment. Please make the transfer and enter your UTR/Reference number so our desk can accept the order.</>
            )}
          </p>
          <button
            onClick={() => setShowUpiModal(true)}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            {order.paymentStatus === 'SUBMITTED' ? 'View / Update UTR Number' : 'Pay via UPI / Submit UTR Now'}
          </button>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
          Shipping & Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600">
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Delivering To:</h4>
            <p className="font-semibold text-gray-800">{order.deliveryAddress?.fullName}</p>
            <p>Phone: {order.deliveryAddress?.mobile}</p>
            <p className="mt-1">
              Door {order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.street}, {order.deliveryAddress?.villageTown}, {order.deliveryAddress?.mandal}, {order.deliveryAddress?.district}, {order.deliveryAddress?.state} - <strong>{order.deliveryAddress?.pinCode}</strong>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">Live Packaging Note:</h4>
            <p className="leading-relaxed">
              Our horticulturists carefully inspect and pack plants within 24-48 hours. You will receive SMS/push alerts when the order moves to <strong>Out for Delivery</strong>.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2.5 border border-forest-200 text-forest-800 hover:bg-forest-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>View Tax Invoice</span>
          </button>

          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <span>Track Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUpiModal && (
        <UpiPaymentModal
          order={order}
          isOpen={showUpiModal}
          onClose={() => setShowUpiModal(false)}
          onSuccess={() => setShowUpiModal(false)}
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal
          orderId={order.orderId}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

    </div>
  );
};

export default OrderSuccess;
