import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Loader2, 
  Copy, 
  Check 
} from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedUtr, setCopiedUtr] = useState('');

  // Rejection modal
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('UTR could not be matched with our nursery bank account statement.');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/payments/admin/all?${params.toString()}`);
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleVerify = async (orderId) => {
    if (window.confirm(`Verify payment for Order ${orderId}? This will move the order to ACCEPTED and notify the customer.`)) {
      try {
        await api.put(`/payments/admin/verify/${orderId}`);
        await fetchPayments();
      } catch (err) {
        alert(err.message || 'Verification failed.');
      }
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    try {
      setSubmittingReject(true);
      await api.put(`/payments/admin/reject/${rejectingOrder.orderId}`, {
        reason: rejectionReason
      });
      setRejectingOrder(null);
      await fetchPayments();
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(''), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          UPI Payment Verification Queue ({payments.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Verify incoming customer UPI reference numbers (UTR) against nursery bank statements. Payments remain strictly unverified until manually approved.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Order ID, UTR number, or Payer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPayments()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600 text-gray-700 w-full md:w-auto"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="SUBMITTED">⏳ UTR Submitted (Awaiting Verification)</option>
          <option value="VERIFIED">✅ Verified Payments</option>
          <option value="REJECTED">⚠️ Rejected Payments</option>
          <option value="PENDING">Pending (No UTR Yet)</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Payer Name</th>
                <th className="py-3 px-4">Payable Amount</th>
                <th className="py-3 px-4">Submitted UTR / Ref No</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No UPI payments found in queue.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isSubmitted = p.paymentStatus === 'SUBMITTED';
                  const isVerified = p.paymentStatus === 'VERIFIED';
                  const isRejected = p.paymentStatus === 'REJECTED';

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block font-mono">{p.orderId}</span>
                        <span className="text-[10px] text-gray-400">{formatDateTime(p.createdAt)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800 block">{p.customerName}</span>
                        <span className="text-[10px] text-gray-400">{p.customerEmail}</span>
                        {p.upiDetails?.payerName && (
                          <span className="text-[10px] text-forest-800 font-semibold block mt-0.5">
                            Payer: {p.upiDetails.payerName}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-sm font-black text-forest-900">{formatCurrency(p.totalAmount)}</span>
                      </td>

                      {/* UTR */}
                      <td className="py-3 px-4">
                        {p.upiDetails?.utr ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900 bg-forest-50/80 px-2 py-1 rounded-lg border border-forest-200/80 max-w-[200px]">
                            <span className="truncate">{p.upiDetails.utr}</span>
                            <button
                              onClick={() => handleCopy(p.upiDetails.utr)}
                              className="text-forest-700 hover:text-forest-900"
                              title="Copy UTR"
                            >
                              {copiedUtr === p.upiDetails.utr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not submitted yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isVerified && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] inline-flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" /> Awaiting Verification
                          </span>
                        )}
                        {isRejected && (
                          <div>
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> REJECTED
                            </span>
                            {p.upiDetails?.rejectionReason && (
                              <p className="text-[10px] text-rose-600 mt-1 max-w-[150px] truncate">{p.upiDetails.rejectionReason}</p>
                            )}
                          </div>
                        )}
                        {!isVerified && !isSubmitted && !isRejected && (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px]">
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified && (
                            <button
                              onClick={() => handleVerify(p.orderId)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
                            >
                              Verify
                            </button>
                          )}
                          {!isRejected && (
                            <button
                              onClick={() => setRejectingOrder(p)}
                              className="px-3 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs transition"
                            >
                              Reject
                            </button>
                          )}
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

      {/* Reject Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 font-heading">
              Reject Payment for Order {rejectingOrder.orderId}
            </h3>
            <p className="text-xs text-gray-500">
              The customer will receive an immediate email and push notification detailing the rejection reason and a link to re-enter their valid UTR.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {submittingReject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPayments;
