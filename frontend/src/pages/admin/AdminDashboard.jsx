import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Store, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error('Failed to load admin metrics', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-black">Marketplace System Overview</h1>
          <p className="text-xs text-purple-200/70">
            Real-time analytics, user access control, vendor onboarding, and global order audit
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs shadow hover:bg-slate-100 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/vendors"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/30 transition-colors"
          >
            Manage Vendors
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl font-bold text-xs border border-white/10 transition-colors"
          >
            All Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Total Platform Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase block">Gross Volume (COD)</span>
          <div className="text-2xl font-black text-slate-900">
            ${loading ? '...' : Number(metrics?.totalRevenue || 0).toFixed(2)}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl w-fit">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase block">Orders Placed</span>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '...' : metrics?.totalOrders || 0}
          </div>
        </div>

        {/* Vendors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl w-fit">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase block">Active Vendors</span>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '...' : metrics?.totalVendors || 0}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl w-fit">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase block">Customers</span>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '...' : metrics?.totalCustomers || 0}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl w-fit">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase block">Catalog SKUs</span>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '...' : metrics?.totalProducts || 0}
          </div>
        </div>
      </div>

      {/* Global Order Status Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">System Order Status Breakdown</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status across all vendors and customers</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <span>View detailed audit log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-xs font-bold text-amber-800 uppercase">Pending</div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {metrics?.ordersByStatus?.PENDING || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
            <div className="text-xs font-bold text-blue-800 uppercase">Confirmed</div>
            <div className="text-2xl font-black text-blue-900 mt-1">
              {metrics?.ordersByStatus?.CONFIRMED || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center">
            <div className="text-xs font-bold text-purple-800 uppercase">Shipped</div>
            <div className="text-2xl font-black text-purple-900 mt-1">
              {metrics?.ordersByStatus?.SHIPPED || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-xs font-bold text-emerald-800 uppercase">Delivered</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {metrics?.ordersByStatus?.DELIVERED || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
