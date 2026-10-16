import React, { useState, useEffect } from 'react';
import { Star, Trash2, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/formatters';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/admin/all');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this customer review?')) {
      try {
        await api.delete(`/reviews/admin/${id}`);
        await fetchReviews();
      } catch (err) {
        alert(err.message || 'Failed to delete review.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Customer Reviews & Ratings ({reviews.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Reviews from verified customers who have received delivered plant orders.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Plant</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No customer reviews yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {r.plant?.name || 'Plant'}
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      {r.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex text-amber-400 gap-0.5">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-sm truncate">
                      {r.comment}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default AdminReviews;
