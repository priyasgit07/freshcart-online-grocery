import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Sign in to your customer account to view your cart, manage quantities, and checkout.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 shadow-md shadow-brand-600/20"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0 && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm mt-8">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your shopping cart is empty</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Explore our fresh grocery catalog and add your favorite fruits, veggies, dairy, and breads!
        </p>
        <Link
          to="/catalog"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 shadow-md shadow-brand-600/20"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const isAtMaxStock = item.quantity >= item.availableStock;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {item.productCategory}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">{item.productName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">${Number(item.productPrice).toFixed(2)} each</p>
                    {isAtMaxStock && (
                      <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Max available stock reached ({item.availableStock})</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Stepper */}
                  <div className="flex items-center space-x-2 border border-slate-200 rounded-xl p-1 bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isAtMaxStock}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <div className="text-base font-extrabold text-slate-900">
                      ${Number(item.itemTotal).toFixed(2)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span className="font-semibold text-slate-800">${Number(cart.totalPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode</span>
              <span className="font-medium text-slate-700">Cash on Delivery (COD)</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
              <span>Estimated Total</span>
              <span className="text-xl text-brand-700">${Number(cart.totalPrice).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 leading-relaxed">
            By checking out you agree to pay upon receipt of goods via Cash on Delivery.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Cart;
