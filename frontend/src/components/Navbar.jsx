import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import {
  ShoppingBag,
  ShoppingCart,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Store,
  LayoutDashboard,
  Package,
  Users,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isVendor, isCustomer, logout } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-emerald-600 bg-clip-text text-transparent">
                FreshCart
              </span>
            </Link>

            {/* Role Badge if logged in */}
            {isAuthenticated && (
              <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' :
                isVendor ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {user.role}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Customer & Guest Links */}
            {(!isAuthenticated || isCustomer) && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/catalog"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/catalog') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Browse Catalog
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/orders"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/orders') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Orders
                  </Link>
                )}
              </>
            )}

            {/* Vendor Links */}
            {isVendor && (
              <>
                <Link
                  to="/vendor/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/vendor/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/vendor/products"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/vendor/products') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Products</span>
                </Link>
                <Link
                  to="/vendor/orders"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/vendor/orders') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
              </>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard') ? 'text-purple-600 bg-purple-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/users') ? 'text-purple-600 bg-purple-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>
                <Link
                  to="/admin/vendors"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/vendors') ? 'text-purple-600 bg-purple-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Vendors</span>
                </Link>
                <Link
                  to="/admin/orders"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/orders') ? 'text-purple-600 bg-purple-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>All Orders</span>
                </Link>
                <Link
                  to="/catalog"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/catalog') ? 'text-purple-600 bg-purple-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Catalog
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Cart Icon (Customer or Admin) */}
            {(!isAuthenticated || isCustomer || isAdmin) && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="View Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell (Logged in) */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Dropdown or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {user?.vendorBusinessName && (
                        <p className="text-xs font-medium text-brand-600 mt-0.5">Store: {user.vendorBusinessName}</p>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/20 transition-all hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {(!isAuthenticated || isCustomer) && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Browse Catalog
              </Link>
              {isAuthenticated && (
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Orders
                </Link>
              )}
            </>
          )}

          {isVendor && (
            <>
              <Link
                to="/vendor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Vendor Dashboard
              </Link>
              <Link
                to="/vendor/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Manage Products
              </Link>
              <Link
                to="/vendor/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Vendor Orders
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                User Management
              </Link>
              <Link
                to="/admin/vendors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Vendor Management
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                All Platform Orders
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-brand-600 rounded-lg text-sm font-semibold text-white hover:bg-brand-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
