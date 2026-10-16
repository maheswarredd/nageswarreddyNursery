import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Filter, 
  Loader2, 
  Eye, 
  Layers,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { PREBUILT_PLANTS_CATALOG } from '../../utils/plantPresets';

const AdminPlants = () => {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [addingDemoLoading, setAddingDemoLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const initialFormState = {
    name: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: 25,
    images: '',
    description: '',
    plantAge: '6-12 Months',
    height: '1 - 1.5 Feet',
    potSize: '6-inch Nursery Pot',
    sunlightRequirement: 'Bright Indirect Light',
    wateringRequirement: 'When topsoil dries',
    soilRequirement: 'Well draining potting mix',
    growingInformation: '',
    benefits: 'Air Purifying, Easy to Grow, Natural Aesthetics',
    plantingSeason: 'All Year Round',
    deliveryInformation: 'Safely packed in multi-layered ventilated boxes.',
    isFeatured: false,
    isPopular: false,
    isNewArrival: false,
    isAvailable: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedPresetName, setSelectedPresetName] = useState('');

  const fetchPlantsAndCategories = async () => {
    try {
      setLoading(true);
      const [plantsRes, catsRes] = await Promise.all([
        api.get('/plants?limit=200'),
        api.get('/categories')
      ]);
      setPlants(plantsRes.data.plants || []);
      setCategories(catsRes.data.categories || []);
      if (catsRes.data.categories?.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catsRes.data.categories[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantsAndCategories();
  }, []);

  const openAddModal = () => {
    setEditingPlantId(null);
    setSelectedPresetName('');
    setFormData({
      ...initialFormState,
      category: categories[0]?._id || ''
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPlantId(p._id);
    setSelectedPresetName('');
    setFormData({
      name: p.name,
      category: p.category?._id || p.category,
      price: p.price,
      discountPrice: p.discountPrice || '',
      stock: p.stock,
      images: Array.isArray(p.images) ? p.images.join(', ') : p.images || '',
      description: p.description,
      plantAge: p.plantAge || '6-12 Months',
      height: p.height || '1 - 1.5 Feet',
      potSize: p.potSize || '6-inch Pot',
      sunlightRequirement: p.sunlightRequirement || '',
      wateringRequirement: p.wateringRequirement || '',
      soilRequirement: p.soilRequirement || '',
      growingInformation: p.growingInformation || '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join(', ') : (p.benefits || ''),
      plantingSeason: p.plantingSeason || 'All Year Round',
      deliveryInformation: p.deliveryInformation || '',
      isFeatured: Boolean(p.isFeatured),
      isPopular: Boolean(p.isPopular),
      isNewArrival: Boolean(p.isNewArrival),
      isAvailable: Boolean(p.isAvailable && p.stock > 0)
    });
    setModalOpen(true);
  };

  // Handler for Pre-built Dropdown Selection
  const handleSelectPreset = (presetName) => {
    setSelectedPresetName(presetName);
    if (!presetName) return;

    const preset = PREBUILT_PLANTS_CATALOG.find(p => p.name === presetName);
    if (!preset) return;

    // Map matching category
    let matchedCatId = categories[0]?._id;
    const foundCat = categories.find(c => c.slug === preset.categorySlug || c.name.toLowerCase().includes(preset.categorySlug?.replace('-', ' ')));
    if (foundCat) {
      matchedCatId = foundCat._id;
    }

    setFormData(prev => ({
      ...prev,
      name: preset.name,
      category: matchedCatId,
      price: preset.price,
      discountPrice: preset.discountPrice || '',
      stock: preset.stock || 30,
      images: Array.isArray(preset.images) ? preset.images.join(', ') : preset.images,
      description: preset.description,
      plantAge: preset.plantAge || '6-12 Months',
      height: preset.height || '1 - 1.5 Feet',
      potSize: preset.potSize || '6-inch Nursery Pot',
      sunlightRequirement: preset.sunlightRequirement || 'Bright Indirect Light',
      wateringRequirement: preset.wateringRequirement || 'Moderate watering',
      soilRequirement: preset.soilRequirement || 'Well draining rich soil',
      growingInformation: preset.growingInformation || '',
      benefits: preset.benefits || 'Air Purifier, Easy Care',
      plantingSeason: preset.plantingSeason || 'All Year Round',
      deliveryInformation: preset.deliveryInformation || 'Secure multi-layered packaging.',
      isFeatured: Boolean(preset.isFeatured),
      isPopular: Boolean(preset.isPopular),
      isNewArrival: Boolean(preset.isNewArrival),
      isAvailable: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        benefits: formData.benefits.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingPlantId) {
        await api.put(`/plants/${editingPlantId}`, payload);
      } else {
        await api.post('/plants', payload);
      }

      setModalOpen(false);
      setNotificationMsg('Plant saved successfully to catalog!');
      setTimeout(() => setNotificationMsg(''), 4000);
      await fetchPlantsAndCategories();
    } catch (err) {
      alert(err.message || 'Failed to save plant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlant = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from catalog?`)) {
      try {
        await api.delete(`/plants/${id}`);
        await fetchPlantsAndCategories();
      } catch (err) {
        alert(err.message || 'Failed to delete plant.');
      }
    }
  };

  // Inline Quick Stock update
  const handleQuickStockUpdate = async (plant, newStock) => {
    try {
      await api.put(`/plants/${plant._id}`, {
        stock: Math.max(0, parseInt(newStock, 10) || 0)
      });
      await fetchPlantsAndCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Add 5 Demo Plants
  const handleAddBatchDemoPlants = async () => {
    try {
      setAddingDemoLoading(true);
      const demoPicks = PREBUILT_PLANTS_CATALOG.slice(0, 8);
      let addedCount = 0;

      for (const preset of demoPicks) {
        // Find matching category
        let catId = categories[0]?._id;
        const found = categories.find(c => c.slug === preset.categorySlug);
        if (found) catId = found._id;

        const payload = {
          ...preset,
          category: catId,
          images: preset.images,
          benefits: typeof preset.benefits === 'string' ? preset.benefits.split(',').map(b => b.trim()) : preset.benefits
        };

        try {
          await api.post('/plants', payload);
          addedCount++;
        } catch {
          // Continue if duplicate
        }
      }

      setNotificationMsg(`Added ${addedCount} pre-built demo plants into the catalog!`);
      setTimeout(() => setNotificationMsg(''), 4000);
      await fetchPlantsAndCategories();
    } catch (err) {
      alert('Failed to batch add demo plants: ' + err.message);
    } finally {
      setAddingDemoLoading(false);
    }
  };

  // Filter plants
  const filteredPlants = plants.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.categoryName?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || String(p.category?._id || p.category) === categoryFilter || p.categoryName === categoryFilter;
    const isSoldOut = !p.isAvailable || p.stock <= 0;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'AVAILABLE' && !isSoldOut) || (statusFilter === 'SOLDOUT' && isSoldOut);
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Extract first image url for preview
  const previewImgUrl = formData.images ? formData.images.split(',')[0].trim() : '';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Plant Catalog & Botanical Inventory ({plants.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Nageswarreddy Nursery Plants • Pre-built linked templates, botanical specs, pricing, and automated Sold-Out stock controls.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleAddBatchDemoPlants}
            disabled={addingDemoLoading}
            className="px-3.5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Instantly add popular demo plants"
          >
            {addingDemoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-700" />}
            <span>Batch Add Demo Plants</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Plant</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search plant name or category (e.g. Mango, Tulsi, Rose)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600 text-gray-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-forest-600 text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">🌿 In Stock</option>
            <option value="SOLDOUT">⛔ Sold Out</option>
          </select>
        </div>
      </div>

      {/* Plants Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Plant & Variety</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Age / Height</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No plants found matching criteria. Click "Add New Plant" or "Batch Add Demo Plants".
                  </td>
                </tr>
              ) : (
                filteredPlants.map((plant) => {
                  const isSoldOut = !plant.isAvailable || plant.stock <= 0;

                  return (
                    <tr key={plant._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={plant.images?.[0] || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100&auto=format&fit=crop&q=80'}
                            alt={plant.name}
                            className="w-10 h-10 rounded-lg object-cover bg-forest-50 border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{plant.name}</span>
                            <span className="text-[10px] text-gray-400">{plant.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 font-semibold text-[11px]">
                          {plant.categoryName || plant.category?.name || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900">{formatCurrency(plant.discountPrice || plant.price)}</span>
                        {plant.discountPrice > 0 && (
                          <span className="text-gray-400 line-through text-[10px] ml-1">{formatCurrency(plant.price)}</span>
                        )}
                      </td>

                      {/* Stock Quantity Column with Quick Updater */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            defaultValue={plant.stock}
                            onBlur={(e) => handleQuickStockUpdate(plant, e.target.value)}
                            className={`w-14 px-2 py-1 border rounded text-xs font-bold text-center ${
                              plant.stock === 0 ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-800'
                            }`}
                          />
                          <span className="text-[10px] text-gray-400">units</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isSoldOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            SOLD OUT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            AVAILABLE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {plant.plantAge || '6M'} • {plant.height || '1-1.5ft'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(plant)}
                            className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition"
                            title="Edit Plant"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlant(plant._id, plant.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Plant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Plant Modal with PREBUILT TEMPLATE DROPDOWN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-gray-900">
                  {editingPlantId ? 'Edit Plant Details' : 'Add New Plant to Catalog'}
                </h3>
                <p className="text-xs text-gray-500">
                  Select a pre-built botanical template or enter custom details. All fields are 100% editable.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRE-BUILT PLANT DROPDOWN SELECTOR */}
            <div className="p-4 bg-gradient-to-r from-forest-50 to-emerald-50 rounded-2xl border-2 border-forest-200 space-y-2">
              <div className="flex items-center gap-2 text-forest-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-forest-700" />
                <span>Select Pre-built Plant Template (Auto-Fill Images, Specs & Pricing):</span>
              </div>
              
              <select
                value={selectedPresetName}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-forest-300 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-forest-600 shadow-xs cursor-pointer"
              >
                <option value="">-- Choose from Pre-built Plants (Money Plant, Mango, Rose, Tulsi, etc.) --</option>
                {PREBUILT_PLANTS_CATALOG.map((item, idx) => (
                  <option key={idx} value={item.name}>
                    🌱 {item.name} ({item.categorySlug}) — ₹{item.discountPrice || item.price}
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-forest-800 italic">
                Selecting a plant automatically links high-resolution photos, realistic descriptions, rates, and care specs. You can still modify any field below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Image Preview Thumbnail */}
              {previewImgUrl && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <img
                    src={previewImgUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover bg-forest-100 border border-gray-200 flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="text-xs">
                    <span className="font-bold text-gray-800 block">Active Plant Photo Preview</span>
                    <span className="text-[11px] text-gray-500 truncate block max-w-sm">{previewImgUrl}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Plant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                  <span className="text-[10px] text-gray-400">0 auto-sets Sold Out</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URLs (comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Botanical Attributes */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Plant Age</label>
                  <input
                    type="text"
                    value={formData.plantAge}
                    onChange={(e) => setFormData({ ...formData, plantAge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pot Size</label>
                  <input
                    type="text"
                    value={formData.potSize}
                    onChange={(e) => setFormData({ ...formData, potSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sunlight Requirement</label>
                  <input
                    type="text"
                    value={formData.sunlightRequirement}
                    onChange={(e) => setFormData({ ...formData, sunlightRequirement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Watering Requirement</label>
                  <input
                    type="text"
                    value={formData.wateringRequirement}
                    onChange={(e) => setFormData({ ...formData, wateringRequirement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Benefits (comma-separated)</label>
                <input
                  type="text"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Growing / Cultivation Tips</label>
                <textarea
                  rows={2}
                  value={formData.growingInformation}
                  onChange={(e) => setFormData({ ...formData, growingInformation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-forest-700"
                  />
                  <span>Featured Plant</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded text-forest-700"
                  />
                  <span>Popular Plant</span>
                </label>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-3">
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
                  className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Plant</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlants;
