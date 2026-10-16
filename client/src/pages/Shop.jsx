import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sprout, Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../utils/api';
import PlantCard from '../components/PlantCard';
import PlantFilter from '../components/PlantFilter';
import { PlantCardSkeleton } from '../components/LoadingSkeleton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPlants, setTotalPlants] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL or defaults
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const availability = searchParams.get('availability') || 'all';
  const sunlight = searchParams.get('sunlight') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();

        if (search) queryParams.set('search', search);
        if (selectedCategory && selectedCategory !== 'all') queryParams.set('category', selectedCategory);
        if (availability && availability !== 'all') queryParams.set('availability', availability);
        if (sunlight && sunlight !== 'all') queryParams.set('sunlight', sunlight);
        if (sort && sort !== 'newest') queryParams.set('sort', sort);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);

        const res = await api.get(`/plants?${queryParams.toString()}`);
        setPlants(res.data.plants || []);
        setTotalPlants(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load plants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [search, selectedCategory, availability, sunlight, sort, maxPrice]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-forest-100">
        <div>
          <h1 className="text-3xl font-bold font-heading text-forest-950">
            Nursery Plants Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing <strong className="text-gray-800">{totalPlants}</strong> healthy, living botanical varieties
            {search && <span> matching "<strong>{search}</strong>"</span>}
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 px-4 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters & Categories</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-28">
          <PlantFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(val) => updateParam('category', val)}
            availability={availability}
            onAvailabilityChange={(val) => updateParam('availability', val)}
            sunlight={sunlight}
            onSunlightChange={(val) => updateParam('sunlight', val)}
            sort={sort}
            onSortChange={(val) => updateParam('sort', val)}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => updateParam('maxPrice', max)}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Plants Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PlantCardSkeleton key={i} />
              ))}
            </div>
          ) : plants.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-forest-100 shadow-sm max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto text-2xl">
                🌱
              </div>
              <h3 className="text-lg font-bold font-heading text-gray-900">No Nursery Plants Found</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We couldn't find any plants matching your active search or filter criteria. Try adjusting the price range or resetting the filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <PlantCard key={plant._id} plant={plant} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <PlantFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(val) => { updateParam('category', val); setMobileFilterOpen(false); }}
              availability={availability}
              onAvailabilityChange={(val) => { updateParam('availability', val); setMobileFilterOpen(false); }}
              sunlight={sunlight}
              onSunlightChange={(val) => { updateParam('sunlight', val); setMobileFilterOpen(false); }}
              sort={sort}
              onSortChange={(val) => { updateParam('sort', val); setMobileFilterOpen(false); }}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => updateParam('maxPrice', max)}
              onReset={() => { handleResetFilters(); setMobileFilterOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
