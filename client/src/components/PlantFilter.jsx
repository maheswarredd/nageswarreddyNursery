import React from 'react';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';

const sunlightOptions = [
  { value: 'all', label: 'All Light Conditions' },
  { value: 'Low to Bright', label: 'Low / Shade Light' },
  { value: 'Indirect', label: 'Bright Indirect Light' },
  { value: 'Full Sun', label: 'Direct Full Sun' }
];

const PlantFilter = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  availability,
  onAvailabilityChange,
  sunlight,
  onSunlightChange,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-forest-100 shadow-sm space-y-6">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-forest-900 font-bold text-base">
          <Filter className="w-4 h-4 text-forest-700" />
          <span>Filter Nursery Plants</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-forest-700 hover:text-forest-900 flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Stock Availability Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
          Availability Status
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'all', label: 'All Plants' },
            { id: 'available', label: '🌿 In Stock' },
            { id: 'soldout', label: '⛔ Sold Out' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onAvailabilityChange(item.id)}
              className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                availability === item.id
                  ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                  : 'bg-forest-50/50 text-gray-700 border-forest-100 hover:bg-forest-100/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
          Categories ({categories.length})
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
              selectedCategory === 'all'
                ? 'bg-forest-100/80 text-forest-900 font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-forest-700" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                selectedCategory === cat.slug
                  ? 'bg-forest-100/80 text-forest-900 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 text-forest-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sunlight Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Sunlight Requirement
        </label>
        <select
          value={sunlight}
          onChange={(e) => onSunlightChange(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-forest-200 bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-600 text-gray-800"
        >
          {sunlightOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Sort Plants By
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full py-2 px-3 text-xs rounded-xl border border-forest-200 bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-600 text-gray-800"
        >
          <option value="newest">Newest Arrivals First</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
          <span className="uppercase tracking-wider">Max Price</span>
          <span className="text-forest-700 font-black">₹{maxPrice || 1000}</span>
        </div>
        <input
          type="range"
          min="100"
          max="1200"
          step="50"
          value={maxPrice || 1000}
          onChange={(e) => onPriceChange(minPrice, e.target.value)}
          className="w-full accent-forest-700 h-2 bg-forest-100 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>₹100</span>
          <span>₹600</span>
          <span>₹1,200</span>
        </div>
      </div>
    </div>
  );
};

export default PlantFilter;
