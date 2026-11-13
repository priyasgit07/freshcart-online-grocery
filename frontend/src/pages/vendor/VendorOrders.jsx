import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Truck, MapPin, Phone, User, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import api from '../../api/axios';

// Status list for advancing orders (CANCELLED is a vendor action, not a dropdown option)
const statusList = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const statusStyle = (status) => {
  switch (status) {
    case 'PENDING':    return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'CONFIRMED':  return 'bg-blue-50 text-blue-800 border-blue-300';
    case 'SHIPPED':    return 'bg-purple-50 text-purple-800 border-purple-300';
    case 'DELIVERED':  return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'CANCELLED':  return 'bg-rose-50 text-rose-800 border-rose-300';
    default:           return 'bg-slate-50 text-slate-800 border-slate-300';
  }
};

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendor/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load vendor orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setFeedback(null);
      await api.patch(`/vendor/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showFeedback('success', `Order #${orderId} marked as ${newStatus}`);
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Reject and cancel Order #${orderId}? This will restore customer inventory and cannot be undone.`)) return;
    try {
      setCancellingId(orderId);
      setFeedback(null);
      await api.patch(`/vendor/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      showFeedback('success', `Order #${orderId} has been rejected and cancelled. Stock restored.`);
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const allStatusOptions = ['', ...statusList, 'CANCELLED'];
  const filteredOrders = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Incoming Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fulfill and update statuses for customer grocery orders
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses ({orders.length})</option>
            {allStatusOptions.filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={loadOrders}
            className="p-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

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
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1">Orders containing your products will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCancelled = order.status === 'CANCELLED';
            const canCancel = order.status === 'PENDING';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border p-6 shadow-sm space-y-4 ${isCancelled ? 'border-rose-200 opacity-75' : 'border-slate-200'}`}
              >
                {/* Top Row: ID, customer, status controls */}
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

                  <div className="flex items-center space-x-2">
                    {isCancelled ? (
                      /* Cancelled badge â€” no controls */
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-rose-50 text-rose-800 border-rose-300">
                        CANCELLED
                      </span>
                    ) : (
                      <>
                        {/* Status Advance Dropdown */}
                        <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id || cancellingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${statusStyle(order.status)}`}
                        >
                          {statusList.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>

                        {/* Reject/Cancel button â€” only for PENDING */}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id || updatingId === order.id}
                            title="Reject this order and restore inventory"
                            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{cancellingId === order.id ? 'Cancellingâ€¦' : 'Reject'}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
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

                {/* Items List */}
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
                          <span className="text-slate-400 ml-2">Qty: {item.quantity} &bull; ${Number(item.price).toFixed(2)} ea</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">${Number(item.itemTotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">Total Order Value (COD):</span>
                  <span className="text-base font-black text-slate-900">${Number(order.totalPrice).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
