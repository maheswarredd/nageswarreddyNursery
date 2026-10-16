import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Heart, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sun, 
  Droplets, 
  Compass, 
  Layers, 
  Calendar, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Loader2,
  MessageSquare
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import PlantCard from '../components/PlantCard';

const PlantDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [plant, setPlant] = useState(null);
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedShare, setCopiedShare] = useState(false);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  useEffect(() => {
    const fetchPlantData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/plants/${slug}`);
        setPlant(res.data.plant);
        setRelatedPlants(res.data.relatedPlants || []);

        // Fetch reviews
        if (res.data.plant?._id) {
          const revRes = await api.get(`/reviews/plant/${res.data.plant._id}`);
          setReviews(revRes.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load plant details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-forest-700 animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Nurturing plant details...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4">
        <Sprout className="w-12 h-12 text-forest-600 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-gray-900">Plant Not Found</h2>
        <p className="text-xs text-gray-500">The plant variety you are looking for may have been relocated or archived.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold">
          Back to Plant Catalog
        </Link>
      </div>
    );
  }

  const isSoldOut = !plant.isAvailable || plant.stock <= 0;
  const wishlisted = isWishlisted(plant._id);

  const price = plant.price;
  const discountPrice = plant.discountPrice && plant.discountPrice > 0 ? plant.discountPrice : null;
  const currentPrice = discountPrice || price;
  const discountPercent = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAddToCart = () => {
    if (!isSoldOut) {
      addToCart(plant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (!isSoldOut) {
      const added = addToCart(plant, quantity);
      if (added) {
        navigate('/cart');
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${plant.name} - Nageswarreddy Nursery Plants`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccessMsg('');
    setReviewErrorMsg('');

    if (!isAuthenticated) {
      setReviewErrorMsg('Please log in with the account you placed your order with.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        plantId: plant._id,
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccessMsg(res.data.message || 'Review submitted successfully!');
      setReviewComment('');
      // Reload reviews
      const revRes = await api.get(`/reviews/plant/${plant._id}`);
      setReviews(revRes.data.reviews || []);
    } catch (err) {
      setReviewErrorMsg(err.message || 'Only customers with a verified DELIVERED order can submit a review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-forest-700">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-forest-700">Plants</Link>
        <span>/</span>
        <Link to={`/shop?category=${plant.category?.slug || plant.category}`} className="hover:text-forest-700">
          {plant.categoryName || 'Category'}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate max-w-xs">{plant.name}</span>
      </nav>

      {/* Main Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Multi-Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-forest-50/50 border border-forest-100 shadow-md">
            <img
              src={plant.images?.[activeImageIndex] || plant.images?.[0]}
              alt={plant.name}
              className={`w-full h-full object-cover transition-all duration-300 ${isSoldOut ? 'grayscale contrast-75' : ''}`}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isSoldOut ? (
                <span className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-black tracking-wider uppercase rounded-lg shadow-lg">
                  SOLD OUT
                </span>
              ) : (
                <>
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow">
                    🌿 In Stock ({plant.stock} Available)
                  </span>
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow">
                      {discountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Action buttons on image */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => toggleWishlist(plant._id)}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition ${
                  wishlisted
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'bg-white/90 text-gray-600 hover:text-rose-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/90 text-gray-600 hover:text-forest-700 shadow-lg backdrop-blur-md transition"
                title="Share Plant"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            {copiedShare && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/75 text-white text-xs rounded-full">
                Link copied to clipboard!
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {plant.images && plant.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {plant.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImageIndex === idx ? 'border-forest-700 ring-2 ring-forest-200' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${plant.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Botanical Details & Purchasing */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-forest-700 bg-forest-100/70 px-2.5 py-0.5 rounded-full">
                {plant.categoryName || plant.category?.name || 'Necessary Plant'}
              </span>
              <span className="text-xs text-gray-400">• Age: {plant.plantAge || '6-12 Months'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-forest-950">
              {plant.name}
            </h1>

            {/* Ratings & Sold Out Status */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-gray-900 ml-1.5">{plant.ratingsAverage?.toFixed(1) || '4.9'}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">{reviews.length} Verified Reviews</span>
              <span className="text-gray-300">|</span>
              {isSoldOut ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Sold Out
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready For Packing ({plant.stock} in stock)
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-forest-950">
                {formatCurrency(currentPrice)}
              </span>
              {discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(price)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Save {formatCurrency(price - discountPrice)}
                </span>
              )}
            </div>
            <div className="text-right text-xs text-forest-800 font-semibold">
              <span>Incl. of nursery taxes</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {plant.description}
          </p>

          {/* Purchasing CTA Controls */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {isSoldOut ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>This Necessary Plant is Currently SOLD OUT</span>
                </div>
                <p>
                  Our greenhouse batch is currently maturing. Add this plant to your wishlist to receive an immediate notification as soon as it becomes available!
                </p>
                <button
                  onClick={() => toggleWishlist(plant._id)}
                  className="mt-1 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition"
                >
                  {wishlisted ? 'In Wishlist (Alert Active)' : 'Notify Me When In Stock'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 font-bold transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(plant.stock, q + 1))}
                      className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 font-bold transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Max {plant.stock} units</span>
                </div>

                {/* Add to Cart & Buy Now Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-6 rounded-2xl border-2 border-forest-700 text-forest-800 font-bold text-sm hover:bg-forest-50 active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-forest-700" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-lg shadow-forest-800/20 active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    <Sprout className="w-4 h-4 text-forest-300" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Assurance Tags */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest-700 flex-shrink-0" />
              <span>Moist Root Transit Pouch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700 flex-shrink-0" />
              <span>Pest-Inspected Healthy Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Botanical Specifications Table */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-forest-100 shadow-sm space-y-8">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-forest-700">Complete Horticultural Profile</span>
          <h2 className="text-2xl font-bold font-heading text-forest-950 mt-1">
            Plant Specifications & Botanical Care Guide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100">
            <div className="flex items-center gap-2 text-forest-800 font-bold text-sm mb-1">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Sunlight Requirement</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{plant.sunlightRequirement || 'Bright Indirect Light'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100">
            <div className="flex items-center gap-2 text-forest-800 font-bold text-sm mb-1">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Watering Requirement</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{plant.wateringRequirement || 'Moderate watering'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100">
            <div className="flex items-center gap-2 text-forest-800 font-bold text-sm mb-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Soil & Mix Requirement</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{plant.soilRequirement || 'Well draining compost mix'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100">
            <div className="flex items-center gap-2 text-forest-800 font-bold text-sm mb-1">
              <Compass className="w-4 h-4 text-purple-500" />
              <span>Approximate Height & Pot</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Height: <strong>{plant.height || '1 - 1.5 Feet'}</strong> • Pot Size: <strong>{plant.potSize || '6-inch Pot'}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100">
            <div className="flex items-center gap-2 text-forest-800 font-bold text-sm mb-1">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Best Planting Season</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{plant.plantingSeason || 'All Year Round'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100">
            <div className="flex items-center gap-2 text-forest-800 font-bold text-sm mb-1">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Delivery & Unboxing Info</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{plant.deliveryInformation || 'Secure multi-layered corrugated packaging.'}</p>
          </div>

        </div>

        {/* Benefits Pills */}
        {plant.benefits && plant.benefits.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Primary Necessary Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {plant.benefits.map((benefit, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Growing Tips */}
        {plant.growingInformation && (
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            <strong className="block font-bold text-sm mb-1 text-amber-950">🌱 Nursery Cultivation & Care Instructions:</strong>
            {plant.growingInformation}
          </div>
        )}
      </section>

      {/* Verified Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-forest-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-forest-700">Customer Feedback</span>
            <h2 className="text-2xl font-bold font-heading text-forest-950 mt-1">
              Verified Buyer Reviews ({reviews.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-black text-gray-900">{plant.ratingsAverage?.toFixed(1) || '5.0'} out of 5</span>
          </div>
        </div>

        {/* Review Form - Verified Purchases Only */}
        <div className="p-6 rounded-2xl bg-forest-50/40 border border-forest-100 space-y-4">
          <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-forest-700" />
            <span>Leave a Verified Customer Review</span>
          </div>
          <p className="text-xs text-gray-500">
            Note: Reviews are permitted only for verified customers who have received a DELIVERED order for this plant.
          </p>

          {reviewSuccessMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
              {reviewSuccessMsg}
            </div>
          )}

          {reviewErrorMsg && (
            <div className="p-3 bg-rose-100 text-rose-800 text-xs rounded-xl font-medium">
              {reviewErrorMsg}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
              <div className="flex gap-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                      reviewRating === star
                        ? 'bg-amber-400 text-amber-950 border-amber-400'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Experience & Plant Condition</label>
              <textarea
                rows={3}
                required
                placeholder="Share how the plant arrived, its health, leaf condition, and growth..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              {submittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Verified Review</span>
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4 pt-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No customer reviews yet. Be the first verified buyer to share your feedback!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{rev.customerName || 'Nursery Customer'}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Verified Purchase
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(rev.createdAt)}</span>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Plants */}
      {relatedPlants.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-forest-950">
            Similar Nursery Plants You May Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedPlants.map((relPlant) => (
              <PlantCard key={relPlant._id} plant={relPlant} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default PlantDetail;
