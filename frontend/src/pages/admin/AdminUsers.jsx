import React, { useState, useEffect } from 'react';
import { Users, Shield, Store, User, Check, X, Trash2, Power, AlertCircle, Search } from 'lucide-react';
import api from '../../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      setFeedback(null);
      const res = await api.patch(`/admin/users/${id}/toggle-status`);
      setUsers(prev => prev.map(u => u.id === id ? res.data : u));
      setFeedback({ type: 'success', message: `User status changed to ${res.data.active ? 'Active' : 'Inactive'}` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to toggle status' });
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently remove user "${name}"?`)) return;
    try {
      setFeedback(null);
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setFeedback({ type: 'success', message: `User ${name} removed.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete user' });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Audit accounts, manage roles, and control access permissions</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="">All Roles ({users.length})</option>
            <option value="ADMIN">Administrators</option>
            <option value="VENDOR">Vendors</option>
            <option value="CUSTOMER">Customers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Contact / Address</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">Loading accounts...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">No matching user accounts found.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                            <p className="text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 font-bold px-2.5 py-1 rounded-full border text-[11px] ${
                          u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          u.role === 'VENDOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> :
                           u.role === 'VENDOR' ? <Store className="w-3 h-3" /> :
                           <User className="w-3 h-3" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 max-w-xs">
                        {u.phone && <p className="font-semibold">{u.phone}</p>}
                        <p className="truncate text-slate-400">{u.address || 'No address provided'}</p>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`font-bold px-2.5 py-1 rounded-lg ${
                          u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        {/* Toggle Active Status (FR10.3) */}
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            u.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.active ? 'Deactivate account' : 'Activate account'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Delete User (FR10.3) */}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete account"
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
    </div>
  );
};

export default AdminUsers;
