import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Sprout, 
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';

const FREE_DELIVERY_THRESHOLD = 499;
const DEFAULT_DELIVERY_CHARGE = 49;

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const deliveryCharge = cartSubtotal >= FREE_DELIVERY_THRESHOLD || cartSubtotal === 0 ? 0 : DEFAULT_DELIVERY_CHARGE;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cartSubtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        cartTotal: cartSubtotal
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.coupon);
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-forest-100/70 text-forest-700 flex items-center justify-center mx-auto text-3xl shadow-inner">
          🛒
        </div>
        <h2 className="text-3xl font-bold font-heading text-forest-950">Your Plant Cart is Empty</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explore our collection of necessary indoor plants, fruit trees, sacred herbs, and daily greens to fill your home with life.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-2xl shadow-lg shadow-forest-800/20 text-sm transition"
          >
            <Sprout className="w-4 h-4" />
            <span>Discover Nursery Plants</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-forest-950">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'Variety' : 'Varieties'})
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review your living plants before safe checkout</p>
      </div>

      {/* Free Delivery Tracker */}
      <div className="p-4 bg-forest-50/80 rounded-2xl border border-forest-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-forest-900 mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-forest-700" />
            <span>
              {amountNeededForFreeDelivery === 0
                ? '🎉 Congratulations! You have unlocked FREE Express Delivery!'
                : `Add ${formatCurrency(amountNeededForFreeDelivery)} more plants for FREE Delivery!`}
            </span>
          </div>
          <span>Threshold: ₹{FREE_DELIVERY_THRESHOLD}</span>
        </div>
        <div className="w-full bg-forest-200/60 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-forest-700 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-forest-100 shadow-sm overflow-hidden">
          <div className="p-6 divide-y divide-gray-100">
            {cartItems.map(({ plant, quantity, unitPrice }) => {
              const currentPrice = plant.discountPrice && plant.discountPrice > 0 ? plant.discountPrice : plant.price;
              const isOverStock = quantity > plant.stock;

              return (
                <div key={plant._id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Plant Image & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={plant.images?.[0] || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=300&auto=format&fit=crop&q=80'}
                      alt={plant.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-forest-50 flex-shrink-0 border border-gray-100"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">
                        {plant.categoryName || 'Plant'}
                      </span>
                      <Link
                        to={`/plant/${plant.slug || plant._id}`}
                        className="text-base font-bold text-gray-900 hover:text-forest-700 block transition line-clamp-1"
                      >
                        {plant.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(currentPrice)} each
                        {plant.stock <= 5 && (
                          <span className="text-rose-600 font-bold ml-2">Only {plant.stock} left in stock!</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-forest-50/20">
                      <button
                        onClick={() => updateQuantity(plant._id, quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold transition text-sm"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-xs font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(plant._id, quantity + 1)}
                        disabled={quantity >= plant.stock}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold transition text-sm disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Total */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-base font-black text-forest-950">
                        {formatCurrency(currentPrice * quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(plant._id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Remove plant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Live nursery plants packed in ventilated moisture crates.</span>
            <button
              onClick={clearCart}
              className="text-rose-600 hover:underline font-semibold"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Apply Discount Coupon
            </label>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800">Coupon {appliedCoupon.code} Applied!</span>
                  <p className="text-emerald-600">Saved {formatCurrency(appliedCoupon.discount)}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PLANTLOVE10 or GREEN50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono uppercase focus:ring-2 focus:ring-forest-600"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-xs text-rose-600 font-medium">{couponError}</p>
            )}

            <p className="text-[11px] text-gray-400">
              Tip: Use <strong>PLANTLOVE10</strong> for 10% off on orders above ₹299.
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatCurrency(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Packaging & Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryCharge)
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-black text-forest-950">
                <span>Total Amount</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}
              className="w-full py-4 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-forest-800/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe payments via UPI & Cash on Delivery</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;
