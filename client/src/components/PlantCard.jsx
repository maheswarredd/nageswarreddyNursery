import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Sun, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/formatters';

const PlantCard = ({ plant }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isSoldOut = !plant.isAvailable || plant.stock <= 0;
  const wishlisted = isWishlisted(plant._id);

  const price = plant.price;
  const discountPrice = plant.discountPrice && plant.discountPrice > 0 ? plant.discountPrice : null;
  const currentPrice = discountPrice || price;
  const discountPercent = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSoldOut) {
      addToCart(plant, 1);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(plant._id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-forest-100/80 shadow-sm hover:shadow-xl hover:border-forest-300 transition-all duration-300 flex flex-col relative">
      
      {/* Plant Image Container */}
      <Link to={`/plant/${plant.slug || plant._id}`} className="relative block aspect-[4/3] overflow-hidden bg-forest-50/40">
        <img
          src={plant.images?.[0] || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80'}
          alt={plant.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isSoldOut ? 'grayscale contrast-75 opacity-80' : ''
          }`}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isSoldOut ? (
            <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-black tracking-wide uppercase rounded-md shadow-md animate-pulse">
              SOLD OUT
            </span>
          ) : (
            <>
              {plant.isFeatured && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-bold rounded-md shadow-sm">
                  ⭐ Featured
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-md shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
              {plant.stock > 0 && plant.stock <= 5 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-md shadow-sm">
                  Only {plant.stock} Left!
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md backdrop-blur-md transition-all ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/80 text-gray-500 hover:text-rose-600 hover:bg-white'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Sunlight tag overlay at bottom */}
        {plant.sunlightRequirement && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded flex items-center gap-1 font-medium">
            <Sun className="w-3 h-3 text-amber-300" />
            <span className="truncate max-w-[140px]">{plant.sunlightRequirement}</span>
          </div>
        )}
      </Link>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <p className="text-[11px] uppercase tracking-wider text-forest-700 font-bold mb-1">
            {plant.categoryName || plant.category?.name || 'Necessary Plant'}
          </p>

          {/* Plant Name */}
          <Link
            to={`/plant/${plant.slug || plant._id}`}
            className="text-base font-bold text-gray-900 group-hover:text-forest-700 transition line-clamp-1"
          >
            {plant.name}
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-bold text-gray-800">{plant.ratingsAverage?.toFixed(1) || '4.9'}</span>
            <span className="text-gray-400">({plant.ratingsQuantity || 12})</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-forest-900">
                {formatCurrency(currentPrice)}
              </span>
              {discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              {isSoldOut ? (
                <span className="text-rose-600 font-bold">Currently Unavailable</span>
              ) : (
                <span className="text-emerald-700 font-semibold">Ready for Dispatch</span>
              )}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isSoldOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-forest-700 text-white hover:bg-forest-800 active:scale-95 shadow-forest-800/10'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
