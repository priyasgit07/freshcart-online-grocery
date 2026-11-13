import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, Store } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedVendor, setSelectedVendor] = useState(searchParams.get('vendorId') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch filter options on mount
  useEffect(() => {
    Promise.all([
      api.get('/products/categories'),
      api.get('/products/vendors')
    ]).then(([catRes, venRes]) => {
      setCategories(catRes.data || []);
      setVendors(venRes.data || []);
    }).catch(err => console.error('Failed to load filter options', err));
  }, []);

  // Sync state if URL searchParams change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedVendor) params.append('vendorId', selectedVendor);
        params.append('page', page);
        params.append('size', 12);
        params.append('sortBy', sortBy);
        params.append('sortDir', sortDir);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch products');
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, selectedVendor, sortBy, sortDir, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedVendor('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(0);
    setError(null);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Grocery Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing <span className="font-semibold text-slate-800">{totalElements}</span> fresh grocery items
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search groceries..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm shadow-sm bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(0);
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Vendor Dropdown */}
          <select
            value={selectedVendor}
            onChange={(e) => {
              setSelectedVendor(e.target.value);
              setPage(0);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          {/* Clear filters button if active */}
          {(search || selectedCategory || selectedVendor) && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 px-2 py-1.5 rounded-lg hover:bg-rose-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('-');
              setSortBy(sb);
              setSortDir(sd);
              setPage(0);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-rose-200 p-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Failed to load grocery products</h3>
          <p className="text-xs text-rose-600 mt-1 max-w-sm mx-auto">
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              clearFilters();
            }}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
          >
            Reset Filters & Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No grocery products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing your filters, or check back later.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination (FR2.4) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                page === idx
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
