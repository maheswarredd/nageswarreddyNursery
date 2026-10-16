import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  QrCode, 
  Loader2, 
  ChevronDown,
  Eye,
  AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import DelayModal from '../../components/DelayModal';
import InvoiceModal from '../../components/InvoiceModal';

const ORDER_STATUSES = [
  'PENDING',
  'PAYMENT_SUBMITTED',
  'ACCEPTED',
  'PROCESSING',
  'READY_FOR_DELIVERY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

const CANCELLATION_REASONS = [
  'plant unavailable',
  'payment not verified',
  'invalid address',
  'delivery unavailable',
  'stock issue',
  'customer requested cancellation',
  'other'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Modals
  const [delayOrderData, setDelayOrderData] = useState(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Cancellation Modal
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('plant unavailable');
  const [cancelDetails, setCancelDetails] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (paymentFilter !== 'ALL') params.set('paymentMethod', paymentFilter);

      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      const order = orders.find(o => o._id === orderId || o.orderId === orderId);
      setCancellingOrder(order);
      return;
    }

    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    try {
      setCancelSubmitting(true);
      await api.put(`/orders/admin/${cancellingOrder._id || cancellingOrder.orderId}/status`, {
        status: 'CANCELLED',
        cancellationReason: cancelReason,
        cancellationDetails: cancelDetails
      });
      setCancellingOrder(null);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Order Dispatch & Fulfillment ({orders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Accept, process, mark delivered, schedule delays, or cancel orders with automated restock and customer notifications.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search order ID, customer name, phone, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600 text-gray-700"
          >
            <option value="ALL">All Order Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600 text-gray-700"
          >
            <option value="ALL">All Payments</option>
            <option value="UPI">UPI</option>
            <option value="COD">COD</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plants Ordered</th>
                <th className="py-3 px-4">Amount & Method</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Change Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isDelivered = order.orderStatus === 'DELIVERED';
                  const isCancelled = order.orderStatus === 'CANCELLED';

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/60 transition">
                      
                      {/* Order ID & Date */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block font-mono">{order.orderId}</span>
                        <span className="text-[10px] text-gray-400">{formatDateTime(order.createdAt)}</span>
                        {order.delayInfo?.isDelayed && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">
                            <Clock className="w-3 h-3" /> Delayed
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800 block">{order.deliveryAddress?.fullName || order.customerName}</span>
                        <span className="text-[11px] text-gray-500">{order.deliveryAddress?.mobile || order.customerPhone}</span>
                        <span className="text-[10px] text-gray-400 block truncate max-w-[150px]">
                          {order.deliveryAddress?.district}, {order.deliveryAddress?.pinCode}
                        </span>
                      </td>

                      {/* Plants */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {order.items?.map((it, i) => (
                            <span key={i} className="block text-gray-700 truncate max-w-[180px]">
                              <strong>{it.quantity}x</strong> {it.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-3 px-4">
                        <span className="font-black text-gray-900 block">{formatCurrency(order.totalAmount)}</span>
                        <span className="text-[10px] font-bold text-forest-800">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                        {order.paymentMethod === 'UPI' && order.upiDetails?.utr && (
                          <span className="text-[10px] font-mono text-gray-500 block truncate max-w-[120px]">
                            UTR: {order.upiDetails.utr}
                          </span>
                        )}
                      </td>

                      {/* Badge */}
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>

                      {/* Status Transition Selector */}
                      <td className="py-3 px-4">
                        <select
                          disabled={isCancelled}
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.orderId || order._id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-forest-600 disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Invoice */}
                          <button
                            onClick={() => setInvoiceOrderId(order.orderId)}
                            className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition"
                            title="Print Tax Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Delay Tool */}
                          {!isDelivered && !isCancelled && (
                            <button
                              onClick={() => setDelayOrderData(order)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Reschedule / Delay Notice"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceOrderId && (
        <InvoiceModal
          orderId={invoiceOrderId}
          isOpen={!!invoiceOrderId}
          onClose={() => setInvoiceOrderId(null)}
        />
      )}

      {/* Delay Modal */}
      {delayOrderData && (
        <DelayModal
          order={delayOrderData}
          isOpen={!!delayOrderData}
          onClose={() => setDelayOrderData(null)}
          onSuccess={() => { setDelayOrderData(null); fetchOrders(); }}
        />
      )}

      {/* Order Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-gray-900">
                Cancel Order {cancellingOrder.orderId}
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Cancellation returns plant inventory stock back to nursery catalog automatically and notifies the customer via email and push notification.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cancellation Reason *</label>
                <select
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Details (Included in notification to customer)</label>
                <textarea
                  rows={2}
                  value={cancelDetails}
                  onChange={(e) => setCancelDetails(e.target.value)}
                  placeholder="e.g., Nursery batch did not meet quality standards; full refund issued..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {cancelSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Cancel Order & Restock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-gray-900 font-heading">
                Order {selectedOrderDetails.orderId}
              </h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="p-3 bg-forest-50/70 rounded-xl space-y-1">
                <p><strong>Customer:</strong> {selectedOrderDetails.customerName} ({selectedOrderDetails.customerEmail})</p>
                <p><strong>Phone:</strong> {selectedOrderDetails.customerPhone}</p>
                <p><strong>Address:</strong> Door {selectedOrderDetails.deliveryAddress?.houseNumber}, {selectedOrderDetails.deliveryAddress?.street}, {selectedOrderDetails.deliveryAddress?.villageTown}, {selectedOrderDetails.deliveryAddress?.mandal}, {selectedOrderDetails.deliveryAddress?.district}, {selectedOrderDetails.deliveryAddress?.state} - {selectedOrderDetails.deliveryAddress?.pinCode}</p>
                {selectedOrderDetails.deliveryAddress?.landmark && <p><strong>Landmark:</strong> {selectedOrderDetails.deliveryAddress.landmark}</p>}
                {selectedOrderDetails.deliveryAddress?.deliveryInstructions && <p><strong>Instructions:</strong> {selectedOrderDetails.deliveryAddress.deliveryInstructions}</p>}
              </div>

              <div>
                <strong className="block mb-1">Status Transition History:</strong>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedOrderDetails.statusHistory?.map((h, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-lg text-[11px] text-gray-600 flex justify-between">
                      <span><strong>{h.status}:</strong> {h.comment}</span>
                      <span className="text-gray-400">{formatDateTime(h.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
