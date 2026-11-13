import React, { useState, useEffect } from 'react';
import { Store, Plus, Mail, Lock, Phone, User, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../../api/axios';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formError, setFormError] = useState(null);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vendors');
      setVendors(res.data || []);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (vendorId, currentActive, vendorName) => {
    try {
      setFeedback(null);
      const res = await api.patch(`/admin/vendors/${vendorId}/toggle-status`);
      setVendors(prev => prev.map(v => v.id === vendorId ? res.data : v));
      const newStatus = res.data.user?.active;
      setFeedback({
        type: 'success',
        message: newStatus
          ? `Vendor "${vendorName}" has been approved and activated.`
          : `Vendor "${vendorName}" has been suspended.`
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update vendor status' });
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      await api.post('/admin/vendors', {
        businessName: businessName.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        description: description.trim(),
      });

      setModalOpen(false);
      setBusinessName('');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setDescription('');

      setFeedback({ type: 'success', message: 'Vendor account created successfully!' });
      setTimeout(() => setFeedback(null), 3500);
      loadVendors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to onboard vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Vendor Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage grocery vendors and provision new merchant storefronts</p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Vendor</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Vendors Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Business / Store</th>
                <th className="py-4 px-6">Representative</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">Loading vendor directory...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">No vendors registered yet.</td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{v.name}</p>
                          <p className="text-slate-400 max-w-xs truncate">{v.description || 'Verified grocery vendor'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {v.user?.name || 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      {v.user?.email || 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      {v.phone || v.user?.phone || 'N/A'}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`font-bold px-2.5 py-1 rounded-lg ${
                        v.user?.active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.user?.active ? 'Active' : 'Pending / Suspended'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {v.user?.active ? (
                        <button
                          onClick={() => handleToggleStatus(v.id, v.user?.active, v.name)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs transition-colors"
                          title="Suspend vendor merchant access"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(v.id, v.user?.active, v.name)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                          title="Approve and activate vendor merchant account"
                        >
                          Approve Vendor
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Vendor Modal (FR10.2) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Onboard New Vendor</h2>
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

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Store Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sunrise Organic Foods"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor Login Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-0144"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specialties, products offered..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
