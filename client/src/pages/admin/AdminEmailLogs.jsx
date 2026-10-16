import React, { useState, useEffect } from 'react';
import { Mail, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';

const AdminEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/email-logs/admin/all${search ? `?search=${search}` : ''}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Brevo Transactional Email Audit Logs ({logs.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed delivery logs for order confirmations, UPI verifications, delay updates, and support notifications.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Recipient Email</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dispatched At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No email logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-bold text-gray-900 font-mono">
                      {log.recipient}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {log.subject}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 font-semibold text-[10px]">
                        {log.template}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'SENT' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SENT
                        </span>
                      ) : log.status === 'LOGGED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          LOGGED (DEV)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminEmailLogs;
