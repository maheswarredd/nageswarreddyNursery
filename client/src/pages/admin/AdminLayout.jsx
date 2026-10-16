import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  FolderTree, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  Truck, 
  HelpCircle, 
  Bell, 
  Star, 
  Tag, 
  BarChart3, 
  Mail, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/plants', label: 'Plants Catalog', icon: Sprout },
  { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/payments', label: 'UPI Payments', icon: CreditCard },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/delivery', label: 'Delivery & Delays', icon: Truck },
  { path: '/admin/queries', label: 'Support Queries', icon: HelpCircle },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/reviews', label: 'Customer Reviews', icon: Star },
  { path: '/admin/coupons', label: 'Coupons & Offers', icon: Tag },
  { path: '/admin/reports', label: 'Reports & Export', icon: BarChart3 },
  { path: '/admin/email-logs', label: 'Email Logs', icon: Mail },
  { path: '/admin/settings', label: 'Settings & UPI', icon: Settings },
];

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not admin, redirect
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-rose-600" />
        <h2 className="text-2xl font-bold font-heading text-gray-900">Access Restricted</h2>
        <p className="text-sm text-gray-600 max-w-md">
          Administrator privileges are required to access this control panel. Please log in with admin credentials.
        </p>
        <Link to="/login" className="px-6 py-2.5 bg-forest-700 text-white font-bold rounded-xl text-xs">
          Go to Sign In
        </Link>
      </div>
    );
  }

  const isLinkActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-forest-950 text-gray-300 border-r border-forest-900 sticky top-0 h-screen">
        
        {/* Brand header */}
        <div className="p-5 border-b border-forest-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white font-bold">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm font-heading leading-tight">Nageswarreddy</h1>
            <p className="text-[10px] text-forest-400 font-bold uppercase tracking-wider">Admin Portal</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-forest-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-forest-200' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-forest-900 space-y-1 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-forest-900/50 transition font-medium"
          >
            <span>Live Customer Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">
              Nursery Administration System
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-700">{user?.name} (Admin)</span>
            <Link
              to="/"
              className="px-3 py-1.5 bg-forest-50 text-forest-800 rounded-lg font-bold border border-forest-200 hover:bg-forest-100 transition hidden sm:inline-block"
            >
              View Storefront
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-64 bg-forest-950 text-gray-300 h-full flex flex-col p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-900">
              <span className="font-bold text-white text-sm">Nageswarreddy Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                      active ? 'bg-forest-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;
