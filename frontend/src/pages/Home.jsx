import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShoppingCart, Truck, ShieldCheck, Leaf } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const categories = [
  { name: 'Fruits & Vegetables', icon: 'ðŸŽ', desc: 'Fresh & organic harvest' },
  { name: 'Dairy & Eggs', icon: 'ðŸ¥›', desc: 'Farm fresh essentials' },
  { name: 'Bakery', icon: 'ðŸž', desc: 'Artisan breads & pastries' },
  { name: 'Beverages', icon: 'ðŸ§ƒ', desc: 'Cold brew, juices & teas' },
  { name: 'Pantry Staples', icon: 'ðŸŒ¾', desc: 'Grains, oils & pulses' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/products?size=4&sortBy=createdAt&sortDir=desc')
      .then((res) => {
        setFeaturedProducts(res.data.content || []);
      })
      .catch((err) => {
        console.error('Failed to load featured products', err);
        setError(err.response?.data?.message || err.message || 'Failed to load fresh arrivals');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16">

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-emerald-800 to-teal-950 text-white shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Fresh Groceries &bull; Direct From Local Vendors</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Daily Groceries, <br />
              <span className="bg-gradient-to-r from-emerald-300 via-brand-200 to-white bg-clip-text text-transparent">
                Delivered Fresh to Your Door.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/80 max-w-xl leading-relaxed">
              Experience convenient online grocery shopping. Browse produce, bakery, dairy, and pantry staples with
              hassle-free <strong>Cash on Delivery (COD)</strong> payment.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/catalog"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white text-brand-900 hover:bg-emerald-50 font-bold text-sm shadow-lg shadow-black/10 transition-all hover:scale-105"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-colors"
              >
                <span>Create Customer Account</span>
              </Link>
            </div>

            <div className="flex items-center space-x-6 pt-4 text-xs font-medium text-emerald-200/90">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-300" />
                <span>Cash on Delivery</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-300" />
                <span>Verified Local Vendors</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-300" />
                <span>Real-Time Status</span>
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Fresh grocery basket"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 text-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-brand-700">Special Promotion</div>
                    <div className="text-sm font-bold text-slate-900">Farm Fresh Gala Apples</div>
                  </div>
                  <span className="text-base font-extrabold text-brand-600">$3.49 / lb</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-500">Pick from our carefully curated grocery selections</p>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalog?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-600">{cat.name}</h3>
              <p className="text-[11px] text-slate-400">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Fresh Arrivals</h2>
            <p className="text-sm text-slate-500">Recently added grocery items ready for your cart</p>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
            <span>Explore all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How It Works</h2>
          <p className="mt-2 text-sm text-slate-500">Grocery ordering simplified in three easy steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Browse & Filter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore hundreds of grocery products filtered by category or your favorite local vendor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Place Order (COD)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add items to your cart, specify your delivery address, and place your order with zero upfront online fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Track & Receive</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow real-time status updates from Confirmed to Delivered, and pay with Cash on Delivery.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
