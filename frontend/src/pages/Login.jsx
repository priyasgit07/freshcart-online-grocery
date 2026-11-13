import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShoppingBag, Shield, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);

      if (from) {
        navigate(from, { replace: true });
      } else if (res.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.role === 'VENDOR') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate('/catalog', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (e, p) => {
    setEmail(e);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-600/20 mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500">Sign in to manage orders, inventory, or start shopping</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 space-y-6">

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Credentials */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick One-Click Test Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@grocery.com', 'Admin@123')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold flex flex-col items-center justify-center transition-colors"
              >
                <Shield className="w-3.5 h-3.5 mb-0.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('freshfarms@grocery.com', 'Vendor@123')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex flex-col items-center justify-center transition-colors"
              >
                <Store className="w-3.5 h-3.5 mb-0.5" />
                <span>Vendor</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('customer@grocery.com', 'Customer@123')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex flex-col items-center justify-center transition-colors"
              >
                <User className="w-3.5 h-3.5 mb-0.5" />
                <span>Customer</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have a customer account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
