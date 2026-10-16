import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sprout, ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import PlantCard from '../components/PlantCard';

const Wishlist = () => {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistPlants = async () => {
      try {
        setLoading(true);
        if (wishlistIds.length === 0) {
          setPlants([]);
          setLoading(false);
          return;
        }

        // Fetch all plants and filter those in wishlistIds
        const res = await api.get('/plants?limit=100');
        const filtered = (res.data.plants || []).filter(p => wishlistIds.includes(p._id));
        setPlants(filtered);
      } catch (err) {
        console.error('Failed to load wishlist plants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistPlants();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading your saved plants...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-forest-950">
          My Saved Plants Wishlist ({plants.length})
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Keep track of varieties you love. You'll receive instant alerts when sold-out plants return to stock!
        </p>
      </div>

      {plants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-forest-100 shadow-sm max-w-md mx-auto space-y-4">
          <Heart className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold font-heading text-gray-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500">
            Click the heart icon on any plant card to save it for later or receive back-in-stock alerts.
          </p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plants.map((plant) => (
            <PlantCard key={plant._id} plant={plant} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Wishlist;
