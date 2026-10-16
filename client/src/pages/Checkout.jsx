import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  ChevronRight,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import UpiPaymentModal from '../components/UpiPaymentModal';

const Checkout = () => {
  const { user, isAuthenticated, addAddress } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedCoupon = location.state?.coupon || null;

  // Saved addresses from user
  const savedAddresses = user?.addresses || [];
  const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0] || null;

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(defaultAddress ? 0 : -1);
  const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0);

  // Address fields
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    mobile: user?.phone || '',
    houseNumber: '',
    street: '',
    villageTown: '',
    mandal: '',
    district: '',
    state: 'Andhra Pradesh',
    pinCode: '',
    landmark: '',
    deliveryInstructions: '',
    isDefault: true
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' or 'COD'
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');

  // UPI Modal state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !createdOrder) {
      navigate('/cart');
    }
  }, [cartItems, createdOrder, navigate]);

  const deliveryCharge = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getActiveDeliveryAddress = () => {
    if (selectedAddressIndex >= 0 && savedAddresses[selectedAddressIndex]) {
      return savedAddresses[selectedAddressIndex];
    }
    return addressForm;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      alert('Please log in or register to place your order so you can track delivery and invoice status.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    const deliveryAddress = getActiveDeliveryAddress();

    // Mandatory address validation
    if (
      !deliveryAddress.fullName ||
      !deliveryAddress.mobile ||
      !deliveryAddress.houseNumber ||
      !deliveryAddress.street ||
      !deliveryAddress.villageTown ||
      !deliveryAddress.mandal ||
      !deliveryAddress.district ||
      !deliveryAddress.state ||
      !deliveryAddress.pinCode
    ) {
      setError('Please provide all mandatory delivery address fields (Full Name, Mobile, House/Door No, Street, Village/Town, Mandal, District, State, PIN Code).');
      return;
    }

    try {
      setOrderLoading(true);

      // Save new address to user profile if it was entered directly
      if (showNewAddressForm && isAuthenticated) {
        try {
          await addAddress(deliveryAddress);
        } catch (err) {
          console.log('Address save note:', err.message);
        }
      }

      // Format payload for backend server-side validation
      const payload = {
        items: cartItems.map(item => ({
          plantId: item.plant._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          fullName: deliveryAddress.fullName,
          mobile: deliveryAddress.mobile,
          houseNumber: deliveryAddress.houseNumber,
          street: deliveryAddress.street,
          villageTown: deliveryAddress.villageTown,
          mandal: deliveryAddress.mandal,
          district: deliveryAddress.district,
          state: deliveryAddress.state,
          pinCode: deliveryAddress.pinCode,
          landmark: deliveryAddress.landmark || '',
          deliveryInstructions: deliveryAddress.deliveryInstructions || ''
        },
        paymentMethod
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        const order = res.data.order;
        setCreatedOrder(order);
        clearCart();

        if (paymentMethod === 'UPI') {
          // Open UPI Payment Modal for customer to scan QR and submit UTR
          setShowUpiModal(true);
        } else {
          // COD: navigate directly to success page
          navigate('/order-success', { state: { order } });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please review your cart.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpiModalSuccess = (updatedOrder) => {
    navigate('/order-success', { state: { order: updatedOrder } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-forest-950">
          Delivery Address & Order Review
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your contact details for safe live-plant packing and shipping.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold font-heading text-gray-900">
                  Delivery Address Information
                </h2>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showNewAddressForm ? 'Select Saved Address' : 'Add New Address'}
                </button>
              )}
            </div>

            {/* Existing Saved Addresses Choice */}
            {!showNewAddressForm && savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                      selectedAddressIndex === idx
                        ? 'border-forest-700 bg-forest-50/40 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="w-4 h-4 text-forest-700" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Mobile: {addr.mobile}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {addr.houseNumber}, {addr.street}, {addr.villageTown}, {addr.mandal}, {addr.district}, {addr.state} - {addr.pinCode}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Address Form Inputs */}
            {(showNewAddressForm || savedAddresses.length === 0) && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Receiver's name"
                      value={addressForm.fullName}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="e.g., 9490123456"
                      value={addressForm.mobile}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      House / Flat / Door Number *
                    </label>
                    <input
                      type="text"
                      name="houseNumber"
                      required
                      placeholder="e.g., Door 4-12/A or Flat 204"
                      value={addressForm.houseNumber}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Street / Road / Colony *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      placeholder="e.g., Green Valley Road, Plant Market"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Village / Town *
                    </label>
                    <input
                      type="text"
                      name="villageTown"
                      required
                      placeholder="e.g., Pulivendula / Kadapa"
                      value={addressForm.villageTown}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mandal *
                    </label>
                    <input
                      type="text"
                      name="mandal"
                      required
                      placeholder="e.g., Kadapa Urban"
                      value={addressForm.mandal}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      placeholder="e.g., YSR Kadapa"
                      value={addressForm.district}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      PIN Code (6 Digits) *
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      required
                      maxLength={6}
                      placeholder="e.g., 516001"
                      value={addressForm.pinCode}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="e.g., Near Shiva Temple or Water Tank"
                      value={addressForm.landmark}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      name="deliveryInstructions"
                      placeholder="e.g., Please leave with security if unavailable"
                      value={addressForm.deliveryInstructions}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h2 className="text-lg font-bold font-heading text-gray-900">
                Select Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Online UPI */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                  paymentMethod === 'UPI'
                    ? 'border-forest-700 bg-forest-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-forest-700" />
                      Online / UPI Payment
                    </span>
                    {paymentMethod === 'UPI' && (
                      <CheckCircle2 className="w-4 h-4 text-forest-700" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Scan dynamic QR Code with GPay, PhonePe, Paytm, or BHIM. Enter your mandatory 12-digit UTR after payment.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-forest-100/60 text-[11px] font-bold text-emerald-800">
                  ⚡ Fastest dispatch processing
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-forest-700 bg-forest-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-forest-700" />
                      Cash on Delivery (COD)
                    </span>
                    {paymentMethod === 'COD' && (
                      <CheckCircle2 className="w-4 h-4 text-forest-700" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Pay in cash directly to our delivery courier partner when the live plants are handed over.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] font-bold text-gray-600">
                  📦 Pay cash upon unboxing
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right: Order Review & Submit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
              Review Items ({cartItems.length})
            </h3>

            {/* Plants Mini List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
              {cartItems.map(({ plant, quantity }) => {
                const price = plant.discountPrice && plant.discountPrice > 0 ? plant.discountPrice : plant.price;
                return (
                  <div key={plant._id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={plant.images?.[0]}
                        alt={plant.name}
                        className="w-9 h-9 rounded-lg object-cover bg-forest-50 flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{plant.name}</p>
                        <p className="text-gray-400">Qty: {quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 flex-shrink-0">
                      {formatCurrency(price * quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Safe Packaging & Delivery</span>
                <span>{deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : formatCurrency(deliveryCharge)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-black text-forest-950">
                <span>Total Amount</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={orderLoading}
              className="w-full py-4 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-forest-800/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {orderLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating & Securing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order ({formatCurrency(grandTotal)})</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-gray-400 space-y-1">
              <p>🌱 All stock and pricing are validated securely on server before order creation.</p>
            </div>
          </div>
        </div>

      </form>

      {/* UPI Payment Modal Popover */}
      {createdOrder && (
        <UpiPaymentModal
          order={createdOrder}
          isOpen={showUpiModal}
          onClose={() => navigate('/order-success', { state: { order: createdOrder } })}
          onSuccess={handleUpiModalSuccess}
        />
      )}

    </div>
  );
};

export default Checkout;
