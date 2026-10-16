import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/admin/customers${search ? `?search=${search}` : ''}`);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Customer Accounts Directory ({customers.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Registered plant enthusiasts and their saved delivery addresses.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search customer by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Saved Addresses</th>
                <th className="py-3 px-4 text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.email}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 font-bold text-[10px]">
                        {c.addresses?.length || 0} Saved Location(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {formatDateTime(c.createdAt)}
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

export default AdminCustomers;
