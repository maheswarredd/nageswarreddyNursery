import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  Search, 
  ShoppingBag, 
  Heart, 
  Bell, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  Package, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, cartSubtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { unreadCount } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdowns on outside click or route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-forest-100 shadow-sm transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-forest-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="hidden sm:inline">🌱</span>
        <span>Free Organic Root Care Pack on orders over ₹499 | Hand-Nurtured Living Plants</span>
        <span className="hidden sm:inline">📦 Safe All-India Delivery</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white shadow-md shadow-forest-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-heading text-forest-950 tracking-tight leading-none block">
                Nageswarreddy
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-forest-700 block">
                Nursery Plants
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search Nursery Plants (e.g., Snake Plant, Mango, Tulsi, Lemon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-forest-200 bg-forest-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-forest-700 absolute left-3.5 top-3.5" />
            <button 
              type="submit" 
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-forest-700 text-white rounded-full text-xs font-semibold hover:bg-forest-800 transition"
            >
              Search
            </button>
          </form>

          {/* Navigation Links & Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Quick Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link to="/shop" className="hover:text-forest-700 transition">Shop Plants</Link>
              <Link to="/care-guide" className="hover:text-forest-700 transition">Care Guide</Link>
              <Link to="/support" className="hover:text-forest-700 transition">Support</Link>
            </nav>

            {/* Notifications Center */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2.5 rounded-full hover:bg-forest-50 text-gray-700 hover:text-forest-800 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-full hover:bg-forest-50 text-gray-700 hover:text-rose-600 transition relative"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-forest-700 text-white hover:bg-forest-800 transition shadow-sm font-medium text-sm group"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-forest-950 font-black text-[11px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-semibold">
                {cartSubtotal > 0 ? `₹${cartSubtotal}` : 'Cart'}
              </span>
            </Link>

            {/* User Account / Profile */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 pl-2.5 rounded-full border border-forest-200 hover:border-forest-400 bg-forest-50/50 transition text-sm font-medium text-gray-800"
                >
                  <span className="w-7 h-7 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.[0] || 'U'}
                  </span>
                  <span className="hidden xl:inline max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-forest-800 bg-forest-50/80 hover:bg-forest-100 font-semibold transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-forest-700" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-forest-50 transition">
                      <Package className="w-4 h-4 text-gray-500" />
                      My Orders
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-forest-50 transition">
                      <User className="w-4 h-4 text-gray-500" />
                      Saved Addresses & Profile
                    </Link>
                    <Link to="/support" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-forest-50 transition">
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      Support Queries
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-forest-800 hover:text-forest-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-full transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-forest-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search plants (Snake Plant, Rose, Mango)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-forest-200 bg-forest-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
            <Search className="w-4 h-4 text-forest-700 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-forest-100 bg-white px-4 py-4 space-y-3">
          <Link to="/shop" className="block py-2 text-base font-medium text-gray-800 hover:text-forest-700">All Plants Catalog</Link>
          <Link to="/shop?availability=available" className="block py-2 text-base font-medium text-emerald-700">🌱 Available Now</Link>
          <Link to="/shop?category=indoor-plants" className="block py-2 text-base font-medium text-gray-800">Indoor Air Purifiers</Link>
          <Link to="/shop?category=fruit-plants" className="block py-2 text-base font-medium text-gray-800">Grafted Fruit Plants</Link>
          <Link to="/shop?category=medicinal-plants" className="block py-2 text-base font-medium text-gray-800">Medicinal & Herbal</Link>
          <Link to="/care-guide" className="block py-2 text-base font-medium text-gray-800">Botanical Care Guide</Link>
          <Link to="/support" className="block py-2 text-base font-medium text-gray-800">Support & Query Desk</Link>
          {isAdmin && (
            <Link to="/admin" className="block py-2 text-base font-bold text-forest-800 bg-forest-50 px-3 rounded-lg">
              🛡️ Admin Control Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
