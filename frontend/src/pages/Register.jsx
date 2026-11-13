import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Phone, UserPlus, AlertCircle, ShoppingBag, Store, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('customer'); // 'customer' | 'vendor'

  // Customer state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Vendor state
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [description, setDescription] = useState('');
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register({
        name,
        email,
        password,
        address,
        phone,
      });

      navigate('/catalog', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (vendorPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/register-vendor', {
        name: vendorName,
        email: vendorEmail,
        password: vendorPassword,
        businessName,
        phone: vendorPhone,
        description,
      });

      setVendorSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Vendor registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-600/20 mx-auto">
          {accountType === 'vendor' ? <Store className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {accountType === 'vendor' ? 'Apply as a Vendor' : 'Create an Account'}
        </h2>
        <p className="text-xs text-slate-500">
          {accountType === 'vendor'
            ? 'Sell your fresh produce and grocery items on FreshCart'
            : 'Join FreshCart for fresh groceries delivered via Cash on Delivery'}
        </p>

        {/* Tab Selector */}
        {!vendorSubmitted && (
          <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs mx-auto mt-4">
            <button
              type="button"
              onClick={() => {
                setAccountType('customer');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                accountType === 'customer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('vendor');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                accountType === 'vendor'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Vendor Partner
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 space-y-6">

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {vendorSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-sm text-slate-600">
                Your vendor application for <strong className="text-slate-800">{businessName}</strong> has been received and is pending administrator review.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
                <strong>Next Step:</strong> An administrator will review and activate your vendor account. Once activated, you will be able to log in and manage your products and inventory.
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : accountType === 'customer' ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-0199"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Postal Code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Business Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Green Valley Farms"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Robert Smith"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="vendor@greenvalley.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="555-0248"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Description</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your products and store..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Vendor accounts require administrator review and approval before activation.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting application...</span>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span>Submit Vendor Application</span>
                  </>
                )}
              </button>
            </form>
          )}

          {!vendorSubmitted && (
            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
                Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
