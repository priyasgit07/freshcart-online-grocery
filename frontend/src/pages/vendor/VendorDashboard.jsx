import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, AlertTriangle, ArrowRight, TrendingUp, Store } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendor/dashboard')
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error('Failed to load vendor metrics', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>Vendor Management Portal</span>
          </div>
          <h1 className="text-3xl font-black">{user?.vendorBusinessName || 'Vendor Dashboard'}</h1>
          <p className="text-xs text-blue-100/80">Manage products, monitor stock inventory, and fulfill incoming orders</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/vendor/products"
            className="px-4 py-2.5 bg-white text-blue-900 rounded-xl font-bold text-xs shadow hover:bg-blue-50 transition-colors flex items-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/vendor/orders"
            className="px-4 py-2.5 bg-blue-700/60 hover:bg-blue-700 text-white rounded-xl font-bold text-xs border border-blue-400/30 transition-colors flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Sales (COD)</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              ${loading ? '...' : Number(metrics?.totalRevenue || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Orders Received */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Orders Received</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : metrics?.totalOrders || 0}
            </div>
          </div>
        </div>

        {/* Listed Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-purple-100 text-purple-700 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Catalog Items</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : metrics?.totalProducts || 0}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Low Stock Alerts (&lt;10)</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              {loading ? '...' : metrics?.lowStockProducts || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Status Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Order Fulfillment Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown of orders for your products</p>
          </div>
          <Link
            to="/vendor/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Update status in Orders</span>
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

export default VendorDashboard;
