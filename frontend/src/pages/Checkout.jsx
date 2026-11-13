import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, MapPin, Phone, User as UserIcon, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Checkout = () => {
  const { cart, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      if (!deliveryAddress && user.address) setDeliveryAddress(user.address);
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mt-2">Add items to your cart before proceeding to checkout.</p>
        <Link
          to="/catalog"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700"
        >
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate submission
    if (!deliveryAddress.trim()) {
      setError('Please provide a complete delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const orderData = {
        deliveryAddress: deliveryAddress.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      };

      const res = await api.post('/orders', orderData);
      const placedOrder = res.data;

      // Cart is cleared on backend; update frontend state
      await fetchCart();
      await fetchNotifications();

      navigate(`/orders?success=${placedOrder.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/cart" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout & Delivery</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your order details and confirm delivery destination.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Delivery Form & Payment Method */}
        <div className="lg:col-span-7 space-y-6">

          {/* Delivery Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>1. Delivery Destination</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 555-0199"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address & Apartment/Suite *
                </label>
                <textarea
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full street address, building/apartment number, and city..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-brand-600" />
              <span>2. Payment Method</span>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/70 border-2 border-brand-500 flex items-start space-x-4">
              <div className="w-5 h-5 rounded-full border-4 border-brand-600 bg-white mt-0.5 shrink-0"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</h4>
                  <span className="text-[10px] bg-brand-200/60 text-brand-800 font-bold px-2 py-0.5 rounded-full">
                    Default
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  No advance payment required. Simply verify your fresh groceries upon arrival and pay in cash to the courier.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Order Confirmation</h2>

          {/* Item scroll list */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center space-x-3 max-w-[70%]">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                    <p className="text-slate-400">Qty: {item.quantity} &times; ${Number(item.productPrice).toFixed(2)}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">${Number(item.itemTotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({cart.totalItems})</span>
              <span className="font-semibold text-slate-800">${Number(cart.totalPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Due (COD)</span>
              <span className="text-2xl text-brand-700">${Number(cart.totalPrice).toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order CTA (FR4.3) */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-brand-600/25 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Placing your order...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Place Order via COD</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Verified Order Dispatch</span>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
