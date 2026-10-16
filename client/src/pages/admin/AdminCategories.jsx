import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import api from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Leaf');
  const [submitting, setSubmitting] = useState(false);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openAdd = () => {
    setEditingCatId(null);
    setName('');
    setDescription('');
    setIcon('Leaf');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCatId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Leaf');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCatId) {
        await api.put(`/categories/${editingCatId}`, { name, description, icon });
      } else {
        await api.post('/categories', { name, description, icon });
      }
      setModalOpen(false);
      await fetchCats();
    } catch (err) {
      alert(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Delete category "${cat.name}"?`)) {
      try {
        await api.delete(`/categories/${cat._id}`);
        await fetchCats();
      } catch (err) {
        alert(err.message || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Plant Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Organize Nursery Plants into indoor, fruit, medicinal, and flowering groups.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                <span className="text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
                  {cat.plantCount || 0} Plants
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{cat.description || 'No description added.'}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-2">slug: {cat.slug}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => openEdit(cat)}
                className="px-3 py-1 text-forest-700 hover:bg-forest-50 rounded-lg font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="px-3 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-gray-900">
                {editingCatId ? 'Edit Category' : 'Create Plant Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Balcony Plants"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
