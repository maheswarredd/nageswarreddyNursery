import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import PlantDetail from './pages/PlantDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import SupportQueries from './pages/SupportQueries';
import PlantCareGuide from './pages/PlantCareGuide';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlants from './pages/admin/AdminPlants';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminQueries from './pages/admin/AdminQueries';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReports from './pages/admin/AdminReports';
import AdminEmailLogs from './pages/admin/AdminEmailLogs';
import AdminSettings from './pages/admin/AdminSettings';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {!isAdminPath && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <LayoutWrapper>
                <Routes>
                  {/* Public & Customer Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/plant/:slug" element={<PlantDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/support" element={<SupportQueries />} />
                  <Route path="/care-guide" element={<PlantCareGuide />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Admin Portal Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="plants" element={<AdminPlants />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="delivery" element={<AdminDelivery />} />
                    <Route path="queries" element={<AdminQueries />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="email-logs" element={<AdminEmailLogs />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Catch-all 404 redirect */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </LayoutWrapper>
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
