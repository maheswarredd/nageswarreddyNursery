import React, { useState } from 'react';
import { X, Clock, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const delayReasons = [
  { value: 'weather', label: 'Inclement Weather / Heavy Rains' },
  { value: 'plant preparation', label: 'Plant Conditioning & Root Hardening' },
  { value: 'transport issue', label: 'Courier Transit Delay / Highway Block' },
  { value: 'address issue', label: 'Customer Address Clarification' },
  { value: 'high order volume', label: 'High Festive Nursery Order Volume' },
  { value: 'stock issue', label: 'Fresh Nursery Batch Maturation' },
  { value: 'other', label: 'Other Operational Reason' }
];

const DelayModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [reason, setReason] = useState('plant preparation');
  const [expectedDate, setExpectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason) {
      setError('Please select a delay reason.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/orders/admin/${order._id || order.orderId}/delay`, {
        reason,
        expectedDeliveryDate: expectedDate || null,
        message: message.trim()
      });

      if (res.data.success) {
        onSuccess(res.data.order);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update order delay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="bg-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">Reschedule / Delay Order</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <p className="text-xs text-gray-600">
            Order: <strong>{order.orderId}</strong> • Customer: <strong>{order.customerName}</strong>
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Delay Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 text-sm"
            >
              {delayReasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Revised Expected Delivery Date
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Message to Customer (included in email & notification)
            </label>
            <textarea
              rows={3}
              placeholder="e.g., We are hydrating and hardening the saplings to withstand transport..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Notify Customer & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DelayModal;
