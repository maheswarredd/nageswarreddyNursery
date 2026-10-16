import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import api from '../utils/api';
import { formatDateTime } from '../utils/formatters';

const queryCategories = [
  'Order problems',
  'Payment problems',
  'Delivery delays',
  'Plant information',
  'Damaged plants',
  'Wrong plants',
  'Cancellation',
  'Refunds',
  'Other issues'
];

const SupportQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'Plant information',
    subject: '',
    description: '',
    orderId: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/queries/my');
      setQueries(res.data.queries || []);
      if (res.data.queries?.length > 0 && !selectedQuery) {
        setSelectedQuery(res.data.queries[0]);
      }
    } catch (err) {
      console.error('Failed to load support queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmittingTicket(true);
      const res = await api.post('/queries', ticketForm);
      if (res.data.success) {
        setShowNewModal(false);
        setTicketForm({
          category: 'Plant information',
          subject: '',
          description: '',
          orderId: ''
        });
        await fetchQueries();
        setSelectedQuery(res.data.query);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit support query.');
    } finally {
      setSubmittingTicket(false);
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
      if (res.data.success) {
        setSelectedQuery(res.data.query);
        setReplyMessage('');
        await fetchQueries();
      }
    } catch (err) {
      alert(err.message || 'Failed to send response.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-forest-950">
            Nursery Support & Query Desk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Direct communication with our nursery horticulturists and dispatch teams.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Query</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Tickets List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-forest-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-forest-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-forest-900">
              My Support Tickets ({queries.length})
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
            {queries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-semibold">No queries submitted.</p>
              </div>
            ) : (
              queries.map((q) => (
                <div
                  key={q._id}
                  onClick={() => setSelectedQuery(q)}
                  className={`p-4 cursor-pointer transition flex flex-col gap-1.5 ${
                    selectedQuery?._id === q._id ? 'bg-forest-50/80 border-l-4 border-forest-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-forest-900">{q.ticketId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      q.status === 'RESOLVED' || q.status === 'CLOSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-gray-900 line-clamp-1">{q.subject}</p>
                  <p className="text-[11px] text-gray-400">{q.category} • {formatDateTime(q.updatedAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-forest-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
          {selectedQuery ? (
            <>
              {/* Thread Header */}
              <div className="p-5 bg-forest-50/40 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded">
                      {selectedQuery.ticketId}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{selectedQuery.category}</span>
                    {selectedQuery.orderId && (
                      <span className="text-xs text-forest-700 font-medium">• Ref Order: {selectedQuery.orderId}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mt-1">{selectedQuery.subject}</h3>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedQuery.status === 'RESOLVED' || selectedQuery.status === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {selectedQuery.status}
                  </span>
                </div>
              </div>

              {/* Messages Chat Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
                {selectedQuery.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                        <span className="font-bold text-gray-700">{msg.senderName}</span>
                        <span>•</span>
                        <span>{formatDateTime(msg.createdAt)}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isAdmin
                            ? 'bg-white border border-forest-200 text-gray-800'
                            : 'bg-forest-700 text-white'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              {selectedQuery.status !== 'CLOSED' ? (
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your response or update..."
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
                    <span>Reply</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-gray-100 text-center text-xs text-gray-500 font-medium">
                  This query ticket has been resolved and closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 space-y-2">
              <MessageSquare className="w-10 h-10 text-gray-300" />
              <p className="text-sm font-semibold">Select a ticket from the left to view conversation.</p>
            </div>
          )}
        </div>

      </div>

      {/* New Query Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-gray-900">
              Submit Customer Support Query
            </h3>
            <p className="text-xs text-gray-500">
              Our botanical and shipping team typically responds within 2-4 business hours.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Issue Category *</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                >
                  {queryCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Related Order ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., NNP-20261016-1234"
                  value={ticketForm.orderId}
                  onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Query regarding watering Banganapalli Mango sapling"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your query or problem in detail..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {submittingTicket && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportQueries;
