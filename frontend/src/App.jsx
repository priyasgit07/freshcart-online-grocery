import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public / Customer Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col justify-between">
              <Navbar />

              <main className="grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* Customer / Authenticated Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'ADMIN']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'ADMIN']}>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* Vendor Routes */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                        <VendorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/products"
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                        <VendorProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/orders"
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                        <VendorOrders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/vendors"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminVendors />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
