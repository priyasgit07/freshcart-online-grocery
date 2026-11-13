import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, MapPin, ChevronDown, ChevronUp, ShoppingBag, ArrowRight, XCircle } from 'lucide-react';
import api from '../api/axios';

const statusSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const statusMeta = {
  PENDING: { label: 'Order Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  CONFIRMED: { label: 'Confirmed by Vendor', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  SHIPPED: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle },
};

const Orders = () => {
  const [searchParams] = useSearchParams();
  const successOrderId = searchParams.get('success');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then((res) => {
        setOrders(res.data || []);
        if (successOrderId && res.data.length > 0) {
          setExpandedOrders({ [successOrderId]: true });
        }
      })
      .catch((err) => console.error('Failed to load orders', err))
      .finally(() => setLoading(false));
  }, [successOrderId]);

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}? Stock will be returned to inventory.`)) return;
    try {
      setCancellingId(orderId);
      await api.patch(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStepIndex = (status) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Success banner if redirected from checkout */}
      {successOrderId && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Order Placed Successfully!</h4>
            <p className="text-xs text-emerald-700">
              Order #{successOrderId} is recorded. The vendor has been notified and will confirm soon.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Track the live status of your grocery orders and deliveries</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-white rounded-3xl animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">You have no orders yet</h3>
          <p className="text-xs text-slate-500 mt-1">Fill your cart from our fresh catalog and place your first order!</p>
          <Link
            to="/catalog"
            className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const isExpanded = !!expandedOrders[order.id];
            const meta = statusMeta[order.status] || statusMeta.PENDING;
            const StatusIcon = meta.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-extrabold text-slate-900">Order #{order.id}</span>
                      <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{order.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={(e) => handleCancelOrder(e, order.id)}
                        disabled={cancellingId === order.id}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                      </button>
                    )}
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Total (COD)</span>
                      <div className="text-lg font-extrabold text-brand-700">
                        ${Number(order.totalPrice).toFixed(2)}
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {order.status === 'CANCELLED' ? (
                  <div className="px-6 py-3 bg-rose-50/70 border-t border-b border-rose-100 flex items-center justify-center space-x-2 text-xs font-semibold text-rose-700">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Order #{order.id} has been cancelled. Inventory has been returned to stock.</span>
                  </div>
                ) : (
                  /* Progress Status Bar (FR5.2) */
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-b border-slate-100">
                    <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                      {/* Connecting line */}
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
                        <div
                          className="h-full bg-brand-600 transition-all duration-500"
                          style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }}
                        ></div>
                      </div>

                      {statusSteps.map((step, idx) => {
                        const isComplete = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isComplete
                                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-brand-200' : ''}`}
                            >
                              {isComplete ? 'âœ“' : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs font-semibold mt-1.5 ${
                                isCurrent ? 'text-brand-700 font-bold' : isComplete ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Delivery Destination */}
                    <div className="flex items-start space-x-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Delivering to: </span>
                        {order.deliveryAddress}
                        {order.customerPhone && <span> &bull; Contact: {order.customerPhone}</span>}
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm">Ordered Items ({order.items.length})</h4>
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                                alt={item.productName}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                              />
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{item.productName}</p>
                                <p className="text-slate-400">Vendor: {item.vendorName} &bull; Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 text-sm">
                              ${Number(item.itemTotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
