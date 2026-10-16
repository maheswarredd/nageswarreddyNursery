import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle2, Loader2, Search } from 'lucide-react';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';

const QUERY_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await api.get(`/queries/admin/all?${params.toString()}`);
      setQueries(res.data.queries || []);
      if (res.data.queries?.length > 0 && !selectedQuery) {
        setSelectedQuery(res.data.queries[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [statusFilter]);

  const handleUpdateStatus = async (status) => {
    if (!selectedQuery) return;
    try {
      const res = await api.put(`/queries/admin/${selectedQuery.ticketId || selectedQuery._id}/status`, { status });
      setSelectedQuery(res.data.query);
      await fetchQueries();
    } catch (err) {
      alert(err.message || 'Failed to update ticket status.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedQuery) return;

    try {
      setSendingReply(true);
      const res = await api.post(`/queries/${selectedQuery.ticketId || selectedQuery._id}/reply`, {
        message: replyMessage.trim()
      });
      setSelectedQuery(res.data.query);
      setReplyMessage('');
      await fetchQueries();
    } catch (err) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Customer Support Tickets ({queries.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Resolve inquiries regarding damaged plants, transit delays, botanical care, and refund processing.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Filter By Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-600"
          >
            <option value="ALL">All Support Tickets</option>
            {QUERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Ticket Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100 max-h-[580px] overflow-y-auto">
          {queries.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-xs">No tickets in this view.</p>
            </div>
          ) : (
            queries.map((q) => (
              <div
                key={q._id}
                onClick={() => setSelectedQuery(q)}
                className={`p-4 cursor-pointer transition ${
                  selectedQuery?._id === q._id ? 'bg-forest-50/80 border-l-4 border-forest-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-gray-900">{q.ticketId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'RESOLVED' || q.status === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {q.status}
                  </span>
                </div>
                <p className="font-bold text-xs text-gray-900 truncate">{q.subject}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{q.customerName} ({q.category})</p>
              </div>
            ))
          )}
        </div>

        {/* Right: Active Ticket Details & Reply Thread */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
          {selectedQuery ? (
            <>
              {/* Header */}
              <div className="p-5 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                      {selectedQuery.ticketId}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{selectedQuery.category}</span>
                    {selectedQuery.orderId && (
                      <span className="text-xs text-forest-700 font-bold">• Order: {selectedQuery.orderId}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mt-1">{selectedQuery.subject}</h3>
                  <p className="text-xs text-gray-500">From: <strong>{selectedQuery.customerName}</strong> ({selectedQuery.customerEmail} • {selectedQuery.customerPhone})</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Status:</span>
                  <select
                    value={selectedQuery.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white"
                  >
                    {QUERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30">
                {selectedQuery.messages.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
                        <span className="font-bold text-gray-700">{msg.senderName} ({msg.sender})</span>
                        <span>•</span>
                        <span>{formatDateTime(msg.createdAt)}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                          isAdmin
                            ? 'bg-forest-800 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type official nursery response (sends Brevo email & push notification)..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600"
                />
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Reply to Customer</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-8">
              Select a ticket to open dialogue.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminQueries;
