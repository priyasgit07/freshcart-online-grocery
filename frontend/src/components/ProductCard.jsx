import React, { useState } from 'react';
import { ShoppingCart, Check, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { isAuthenticated, isVendor } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isVendor) {
      setError('Vendors cannot place orders.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (isOutOfStock) return;

    try {
      setAdding(true);
      setError(null);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      setTimeout(() => setError(null), 3500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Product Image & Stock Badge */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Category Tag */}
          <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
            {product.category}
          </span>

          {/* Stock Badges */}
          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <span className="bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                Only {product.stock} Left
              </span>
            ) : (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                In Stock ({product.stock})
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{product.vendorName}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-brand-600 transition-colors" title={product.name}>
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed" title={product.description}>
            {product.description || 'Fresh and wholesome groceries delivered directly to your doorstep.'}
          </p>
        </div>
      </div>

      {/* Footer / Price and Cart Action */}
      <div className="p-4 pt-0">
        {error && (
          <div className="mb-2 text-xs text-rose-600 flex items-center space-x-1 font-medium bg-rose-50 p-1.5 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <div className="text-lg font-extrabold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20 hover:shadow'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : adding ? (
              <span>Adding...</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
