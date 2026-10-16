import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, QrCode, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AdminSettings = () => {
  const [form, setForm] = useState({
    siteName: 'Nageswarreddy Nursery Plants',
    tagline: 'Living Greens, Pure Air, Nursery Plants for Every Home',
    upiId: 'nageswarreddyplants@okaxis',
    upiName: 'Nageswarreddy Nursery Plants',
    supportPhone: '+91 94901 23456',
    supportEmail: 'support@nageswarreddyplants.com',
    nurseryAddress: 'Nageswarreddy Green Farms & Nursery, NH-40, Kadapa, Andhra Pradesh 516001, India',
    deliveryCharge: 49,
    freeDeliveryThreshold: 499,
    lowStockThreshold: 5,
    announcementText: '🌱 Special Monsoon Offer: Free Healthy Organic Fertilizer with every plant order!'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.settings) {
          setForm(res.data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      await api.put('/settings', form);
      setSuccessMsg('Nursery store settings and UPI details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
        <p className="text-xs text-gray-500 font-semibold">Loading nursery store settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Store Configuration & Official UPI Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure payment receiver UPI ID, dynamic QR code payee name, delivery charge thresholds, and plant safety alert limits.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* UPI Payments Configuration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-forest-900 font-bold text-sm border-b pb-3">
            <QrCode className="w-5 h-5 text-forest-700" />
            <span>Official UPI Merchant Configuration (Customer QR Code)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Admin UPI ID / VPA *
              </label>
              <input
                type="text"
                name="upiId"
                required
                value={form.upiId}
                onChange={handleChange}
                placeholder="e.g. nageswarreddyplants@okaxis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-forest-600"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Customers scan dynamic QR code generated specifically for this VPA.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                UPI Merchant Payee Name *
              </label>
              <input
                type="text"
                name="upiName"
                required
                value={form.upiName}
                onChange={handleChange}
                placeholder="Nageswarreddy Nursery Plants"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>
        </div>

        {/* Nursery Contact & Address */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-3">
            Nursery Contact & Physical Farm Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Support Phone</label>
              <input
                type="text"
                name="supportPhone"
                value={form.supportPhone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={form.supportEmail}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-gray-700 mb-1">
              Physical Nursery Address (Printed on Tax Invoices)
            </label>
            <input
              type="text"
              name="nurseryAddress"
              value={form.nurseryAddress}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Pricing & Stock Rules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-3">
            Packaging, Delivery Charges & Safety Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                min="0"
                name="deliveryCharge"
                value={form.deliveryCharge}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                min="0"
                name="freeDeliveryThreshold"
                value={form.freeDeliveryThreshold}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                min="1"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-gray-700 mb-1">Announcement Bar Banner Message</label>
            <input
              type="text"
              name="announcementText"
              value={form.announcementText}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Store Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default AdminSettings;
