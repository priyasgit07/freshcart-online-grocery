import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Truck, MapPin, Phone, User, Search, RefreshCw, Store } from 'lucide-react';
import api from '../../api/axios';

const statusList = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load all orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch = !search ||
      o.id.toString().includes(search) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Platform Order Audit</h1>
          <p className="text-sm text-slate-500 mt-1">Audit and inspect all grocery transactions placed in the marketplace</p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 text-slate-600 hover:text-purple-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-fit"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses ({orders.length})</option>
            {statusList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-3xl animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-slate-900 text-base">Order #{order.id}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    COD
                  </span>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  order.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                  order.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                  order.status === 'SHIPPED' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                  'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Customer: {order.customerName} ({order.customerEmail})</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Phone: {order.customerPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Delivery Address:</span>
                    <p className="text-slate-600 mt-0.5">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="divide-y divide-slate-100 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=60&q=80'}
                        alt={item.productName}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-900">{item.productName}</span>
                        <span className="text-slate-400 ml-2">Vendor: {item.vendorName} &bull; Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800">${Number(item.itemTotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">Total Order Amount (Cash on Delivery):</span>
                <span className="text-base font-black text-slate-900">${Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
