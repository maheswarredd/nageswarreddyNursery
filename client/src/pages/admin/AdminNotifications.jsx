import React, { useState } from 'react';
import { Bell, Send, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('/shop');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      setSuccessMsg('');
      const res = await api.post('/notifications/broadcast', {
        title,
        message,
        link
      });
      if (res.data.success) {
        setSuccessMsg('Notification broadcasted to all in-app centers and Web Push devices!');
        setTitle('');
        setMessage('');
      }
    } catch (err) {
      alert(err.message || 'Broadcast failed.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Broadcast Push & In-App Notifications
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Send real-time alerts to customers for new seasonal plant batches, back-in-stock varieties, or festival offers.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Notification Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 🌿 Fresh Monsoon Banganapalli Mango Batch Ready!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Notification Body Message *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Grafted Banganapalli mango trees are now available for dispatch with free root gel packing. Order today before batch finishes."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Target Store Link
            </label>
            <input
              type="text"
              placeholder="/shop or /shop?category=fruit-plants"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600 font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send Broadcast Push to All Users</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AdminNotifications;
