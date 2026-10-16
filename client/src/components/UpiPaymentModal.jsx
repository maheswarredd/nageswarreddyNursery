import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const UpiPaymentModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [upiDetails, setUpiDetails] = useState(null);
  const [payerName, setPayerName] = useState(order?.deliveryAddress?.fullName || '');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      const fetchUpi = async () => {
        try {
          const res = await api.get(`/payments/upi-info/${order._id || order.orderId}`);
          setUpiDetails(res.data);
        } catch (err) {
          console.error('Failed to load UPI details:', err);
        }
      };
      fetchUpi();
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!payerName.trim()) {
      setError('Please enter the name registered with your UPI payment app.');
      return;
    }

    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setError('Please enter a valid 12-digit UPI Transaction / UTR number.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/payments/submit-upi', {
        orderId: order._id || order.orderId,
        payerName: payerName.trim(),
        utr: cleanUtr
      });

      if (res.data.success) {
        onSuccess(res.data.order);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit payment details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-forest-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-forest-200 hover:text-white hover:bg-forest-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <QrCode className="w-5 h-5 text-forest-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-forest-200">Official Nursery Payment</span>
          </div>
          <h2 className="text-xl font-bold font-heading">Complete UPI Payment</h2>
          <p className="text-xs text-forest-100 mt-1">
            Order ID: <strong>{order.orderId}</strong> • Amount: <strong>{formatCurrency(order.totalAmount)}</strong>
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: QR Code & Admin UPI ID */}
          <div className="bg-forest-50/70 border border-forest-200/60 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-800 mb-3">
              Step 1: Scan & Pay with any UPI App
            </p>

            {upiDetails?.qrCodeDataUrl ? (
              <div className="inline-block p-3 bg-white rounded-xl shadow-md border border-forest-100 mb-3">
                <img
                  src={upiDetails.qrCodeDataUrl}
                  alt="UPI QR Code"
                  className="w-48 h-48 mx-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto flex items-center justify-center bg-forest-100/50 rounded-xl mb-3">
                <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
              </div>
            )}

            <div className="text-xs text-gray-700 space-y-1">
              <p>Scan with <strong>Google Pay, PhonePe, Paytm, BHIM, or CRED</strong></p>
              <p className="text-sm font-black text-forest-900">
                Exact Payable Amount: {formatCurrency(order.totalAmount)}
              </p>
            </div>

            {/* UPI ID copy pill */}
            <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-forest-200 rounded-full shadow-sm text-xs font-mono text-gray-800">
              <span>UPI ID: <strong>{upiDetails?.upiId || 'nageswarreddyplants@okaxis'}</strong></span>
              <button
                type="button"
                onClick={() => handleCopy(upiDetails?.upiId || 'nageswarreddyplants@okaxis')}
                className="text-forest-700 hover:text-forest-900 ml-1"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Bank Security Notice:</strong> After transferring, enter your UTR/Reference number below. Our nursery accountant verifies all UTRs against our official bank statement before order dispatch.
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Step 2: Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Step 2: Enter Transaction Details (Mandatory)
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Payer Full Name (as per UPI / Bank Account) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Mahesh Reddy"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                12-Digit UPI Transaction ID / UTR Number *
              </label>
              <input
                type="text"
                required
                maxLength={24}
                placeholder="e.g., 428910283741 or UPI Ref ID"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm font-mono tracking-wider"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Found in your payment app under "Details / Transaction History / UPI Ref No".
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Details...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Payment Details for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
