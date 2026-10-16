import React, { useState, useEffect } from 'react';
import { Truck, Clock, AlertTriangle, Calendar, Search } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import DelayModal from '../../components/DelayModal';

const AdminDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDelayOrder, setActiveDelayOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch active orders (non-cancelled, non-delivered)
      const res = await api.get('/orders/admin/all?limit=100');
      const active = (res.data.orders || []).filter(o => o.orderStatus !== 'CANCELLED');
      setOrders(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Delivery Logistics & Delay Management ({orders.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor plant dispatch schedules, track moisture packing readiness, and schedule automated delay notices to customers with revised delivery dates.
        </p>
      </div>

      {/* Orders Dispatch Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & District</th>
                <th className="py-3 px-4">Plants Count</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Delay State</th>
                <th className="py-3 px-4 text-right">Logistics Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No active orders in delivery queue.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {order.orderId}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-800 block">{order.deliveryAddress?.fullName}</span>
                      <span className="text-[10px] text-gray-400">{order.deliveryAddress?.district}, {order.deliveryAddress?.state} ({order.deliveryAddress?.pinCode})</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-700">{order.items?.length || 1} plant varieties</span>
                    </td>

                    <td className="py-3 px-4">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>

                    <td className="py-3 px-4">
                      {order.delayInfo?.isDelayed ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Delayed: {order.delayInfo.reason}
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Expected: <strong>{formatDate(order.delayInfo.expectedDeliveryDate) || 'TBD'}</strong>
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">On Standard Schedule</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {order.orderStatus !== 'DELIVERED' && (
                        <button
                          onClick={() => setActiveDelayOrder(order)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
                        >
                          {order.delayInfo?.isDelayed ? 'Update Delay' : 'Set Delay Notice'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delay Modal */}
      {activeDelayOrder && (
        <DelayModal
          order={activeDelayOrder}
          isOpen={!!activeDelayOrder}
          onClose={() => setActiveDelayOrder(null)}
          onSuccess={() => { setActiveDelayOrder(null); fetchOrders(); }}
        />
      )}

    </div>
  );
};

export default AdminDelivery;
