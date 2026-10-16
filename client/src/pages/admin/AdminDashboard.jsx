import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck, 
  RotateCcw,
  BarChart3,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Calculating nursery metrics & reports...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const lowStockPlants = stats?.lowStockPlants || [];
  const bestSellers = stats?.bestSellers || [];
  const salesChart = stats?.salesChart || [];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">
            Nursery Executive Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time operations, inventory sync, and order dispatch metrics for Nageswarreddy Nursery Plants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Manage Active Orders
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition"
          >
            Export CSV Reports
          </Link>
        </div>
      </div>

      {/* Low Stock Urgent Alert Banner */}
      {lowStockPlants.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-950 text-sm">Low Stock Alert: </span>
              <span><strong>{lowStockPlants.length}</strong> necessary plant varieties have fallen below safety inventory threshold (≤ 5 units).</span>
            </div>
          </div>
          <Link
            to="/admin/plants"
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg self-start sm:self-auto transition"
          >
            Restock Plants
          </Link>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Plants */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Plants</span>
          <div className="text-2xl font-black text-gray-900 font-heading">{metrics.totalPlants || 0}</div>
          <div className="text-[11px] text-emerald-700 font-bold">{metrics.availablePlants || 0} In Stock</div>
        </div>

        {/* Sold Out Plants */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sold Out</span>
          <div className="text-2xl font-black text-rose-600 font-heading">{metrics.soldOutPlants || 0}</div>
          <div className="text-[11px] text-gray-400">Auto-blocked</div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Delivered Sales</span>
          <div className="text-2xl font-black text-forest-800 font-heading">{formatCurrency(metrics.totalSales || 0)}</div>
          <div className="text-[11px] text-gray-400">{metrics.deliveredOrders || 0} Orders Completed</div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending Orders</span>
          <div className="text-2xl font-black text-amber-600 font-heading">{metrics.pendingOrders || 0}</div>
          <div className="text-[11px] text-amber-700 font-medium">Awaiting action</div>
        </div>

        {/* Accepted Orders */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">In Processing</span>
          <div className="text-2xl font-black text-cyan-700 font-heading">{metrics.acceptedOrders || 0}</div>
          <div className="text-[11px] text-cyan-800 font-medium">Packing & Transit</div>
        </div>

        {/* Cancelled */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cancelled Orders</span>
          <div className="text-2xl font-black text-gray-600 font-heading">{metrics.cancelledOrders || 0}</div>
          <div className="text-[11px] text-gray-400">Restocked to nursery</div>
        </div>

      </div>

      {/* Secondary Financial & Payment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Pending Payments</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{metrics.pendingPayments || 0} Orders</p>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">{formatCurrency(metrics.pendingPaymentAmount || 0)} to verify</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Verified Payments</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{metrics.completedPayments || 0} Orders</p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Bank Confirmed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Refunds Processed</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{metrics.refundedPayments || 0} Orders</p>
            <p className="text-xs text-gray-400 mt-0.5">Direct bank credit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Payment Channels</p>
            <p className="text-xs text-gray-700 mt-1 font-bold">UPI: {metrics.paymentMethods?.upi || 0} Orders</p>
            <p className="text-xs text-gray-700 font-bold">COD: {metrics.paymentMethods?.cod || 0} Orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Charts & Best Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sales Chart (7-day trend bar graph) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-gray-900">7-Day Sales & Order Volume</h3>
              <p className="text-xs text-gray-500">Daily revenue intake from living plant orders</p>
            </div>
            <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-lg">
              Live Aggregation
            </span>
          </div>

          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-3 h-48 px-2">
              {salesChart.map((item, idx) => {
                const maxVal = Math.max(...salesChart.map(s => s.sales), 1000);
                const heightPercent = Math.max(10, Math.min(100, (item.sales / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition">
                      ₹{item.sales}
                    </div>
                    <div className="w-full max-w-[42px] bg-forest-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-36">
                      <div
                        className="bg-forest-700 w-full rounded-t-xl transition-all duration-500 group-hover:bg-forest-800"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600">{item.date}</span>
                    <span className="text-[10px] text-gray-400">({item.orders} ord)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Best Selling Plants */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-gray-900">Top-Selling Plant Varieties</h3>
            <p className="text-xs text-gray-500">Highest order volume across varieties</p>
          </div>

          <div className="space-y-3">
            {bestSellers.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No sales recorded yet.</p>
            ) : (
              bestSellers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-forest-200 text-forest-800 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800 truncate">{item.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-forest-900">{item.totalQuantity} units</span>
                    <p className="text-[10px] text-gray-400">{formatCurrency(item.totalRevenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
