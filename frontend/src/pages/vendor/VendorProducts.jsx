import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle, Package, RefreshCw, Save } from 'lucide-react';
import api from '../../api/axios';

const categoriesList = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery',
  'Beverages',
  'Pantry Staples',
  'Snacks',
  'Household Essentials'
];

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categoriesList[0]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Inline stock edits
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendor/products');
      setProducts(res.data || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory(categoriesList[0]);
    setPrice('');
    setStock('20');
    setImageUrl('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category);
    setPrice(p.price);
    setStock(p.stock);
    setImageUrl(p.imageUrl || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl: imageUrl.trim(),
      };

      if (editingProduct) {
        await api.put(`/vendor/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/vendor/products', payload);
      }

      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from your catalog?')) return;
    try {
      await api.delete(`/vendor/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleInlineStockUpdate = async (productId) => {
    const stockNum = parseInt(newStockVal, 10);
    if (isNaN(stockNum) || stockNum < 0) return;
    try {
      await api.patch(`/vendor/products/${productId}/stock`, { stock: stockNum });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: stockNum } : p));
      setEditingStockId(null);
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Product Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage listings, prices, descriptions, and stock quantities</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">Loading catalog items...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    No products added yet. Click &quot;Add New Product&quot; to list items.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock > 0 && p.stock < 10;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                            <p className="text-slate-400 max-w-xs truncate">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        ${Number(p.price).toFixed(2)}
                      </td>

                      {/* Stock Level (Inline editable) */}
                      <td className="py-4 px-6">
                        {editingStockId === p.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={newStockVal}
                              onChange={(e) => setNewStockVal(e.target.value)}
                              className="w-16 px-2 py-1 border border-blue-400 rounded-lg text-sm font-bold focus:outline-none"
                            />
                            <button
                              onClick={() => handleInlineStockUpdate(p.id)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold px-2.5 py-1 rounded-lg ${
                              isOut ? 'bg-rose-100 text-rose-800' :
                              isLow ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock} units {isOut ? '(Out of Stock)' : isLow ? '(Low)' : ''}
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setNewStockVal(p.stock.toString());
                              }}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                            >
                              Adjust
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Item'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Honeycrisp Apples"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3.99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Stock Count *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe freshness, origin, quantity..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
