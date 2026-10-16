import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  QrCode, 
  X, 
  MessageSquare,
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import OrderStatusBadge from '../components/OrderStatusBadge';
import UpiPaymentModal from '../components/UpiPaymentModal';
import InvoiceModal from '../components/InvoiceModal';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeUpiOrder, setActiveUpiOrder] = useState(null);
  const [activeInvoiceOrderId, setActiveInvoiceOrderId] = useState(null);

  // Cancellation modal
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [cancelDetails, setCancelDetails] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    try {
      setCancelLoading(true);
      await api.put(`/orders/${cancellingOrder._id || cancellingOrder.orderId}/cancel`, {
        reason: cancelReason,
        details: cancelDetails
      });
      setCancellingOrder(null);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Retrieving order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-forest-950">
          My Plant Orders ({orders.length})
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track packaging, transit status, UPI verification, and invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-forest-100 shadow-sm max-w-md mx-auto space-y-4">
          <Package className="w-12 h-12 text-forest-600 mx-auto" />
          <h3 className="text-lg font-bold font-heading text-gray-900">No Orders Yet</h3>
          <p className="text-xs text-gray-500">You haven't ordered any Nursery Plants yet.</p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition"
          >
            Start Shopping Plants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = ['PENDING', 'PAYMENT_SUBMITTED', 'ACCEPTED'].includes(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-forest-100 shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-forest-50/50 p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Order ID</span>
                    <p className="font-bold text-gray-900 text-sm">{order.orderId}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Date Placed</span>
                    <p className="font-semibold text-gray-800">{formatDateTime(order.createdAt)}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Payment</span>
                    <p className="font-semibold text-gray-800">
                      {order.paymentMethod} ({order.paymentStatus})
                    </p>
                  </div>

                  <div>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>

                {/* Delay Notice Banner if order delayed */}
                {order.delayInfo?.isDelayed && (
                  <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950">Delivery Timeline Update: </span>
                      <span>
                        Rescheduled due to {order.delayInfo.reason}. Expected arrival: <strong>{formatDate(order.delayInfo.expectedDeliveryDate) || 'Soon'}</strong>.
                      </span>
                      {order.delayInfo.message && (
                        <p className="text-amber-800 italic mt-0.5 font-medium">"{order.delayInfo.message}"</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items & Address Body */}
                <div className="p-6 space-y-6">
                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=200&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-forest-50 border border-gray-100 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: <strong>{item.quantity}</strong> × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-gray-900 text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          {order.orderStatus === 'DELIVERED' && (
                            <Link
                              to={`/plant/${item.plant?.slug || item.plant}`}
                              className="block text-[11px] font-bold text-forest-700 hover:underline mt-1"
                            >
                              ⭐ Leave Review
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Address */}
                  <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Delivering To:</h4>
                      <p className="font-semibold text-gray-800">{order.deliveryAddress?.fullName} ({order.deliveryAddress?.mobile})</p>
                      <p>
                        Door {order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.street}, {order.deliveryAddress?.villageTown}, {order.deliveryAddress?.mandal}, {order.deliveryAddress?.district}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pinCode}
                      </p>
                    </div>

                    <div className="md:text-right space-y-1">
                      <p>Subtotal: <strong>{formatCurrency(order.subtotal)}</strong></p>
                      <p>Delivery: <strong>{order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}</strong></p>
                      {order.discount > 0 && <p className="text-emerald-700">Discount: -{formatCurrency(order.discount)}</p>}
                      <p className="text-sm font-black text-forest-950 pt-1">
                        Grand Total: {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-gray-50/70 p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveInvoiceOrderId(order.orderId)}
                      className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-forest-300 rounded-xl font-bold text-gray-700 flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-forest-700" />
                      <span>Print Tax Invoice</span>
                    </button>

                    <Link
                      to="/support"
                      className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-forest-300 rounded-xl font-bold text-gray-700 flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                      <span>Support Ticket</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.paymentMethod === 'UPI' && order.paymentStatus !== 'VERIFIED' && order.orderStatus !== 'CANCELLED' && (
                      <button
                        onClick={() => setActiveUpiOrder(order)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{order.paymentStatus === 'SUBMITTED' ? 'Update UTR' : 'Pay / Submit UTR'}</span>
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* UPI Modal */}
      {activeUpiOrder && (
        <UpiPaymentModal
          order={activeUpiOrder}
          isOpen={!!activeUpiOrder}
          onClose={() => setActiveUpiOrder(null)}
          onSuccess={() => { setActiveUpiOrder(null); fetchOrders(); }}
        />
      )}

      {/* Invoice Modal */}
      {activeInvoiceOrderId && (
        <InvoiceModal
          orderId={activeInvoiceOrderId}
          isOpen={!!activeInvoiceOrderId}
          onClose={() => setActiveInvoiceOrderId(null)}
        />
      )}

      {/* Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">
              Cancel Order {cancellingOrder.orderId}?
            </h3>
            <p className="text-xs text-gray-500">
              Please let us know the reason for cancelling this order so we can improve our nursery service.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason for Cancellation *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Delivery address incorrect">Delivery address incorrect</option>
                  <option value="Found alternative variety">Found alternative variety</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Additional Details (Optional)</label>
                <textarea
                  rows={2}
                  value={cancelDetails}
                  onChange={(e) => setCancelDetails(e.target.value)}
                  placeholder="Tell us more..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {cancelLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrders;
