import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || (!isCustomer && !isAdmin)) {
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer, isAdmin]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { productId, quantity });
    setCart(res.data);
    return res.data;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const res = await api.put(`/cart/${cartItemId}?quantity=${quantity}`);
    setCart(res.data);
    return res.data;
  };

  const removeFromCart = async (cartItemId) => {
    const res = await api.delete(`/cart/${cartItemId}`);
    setCart(res.data);
    return res.data;
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [], totalPrice: 0, totalItems: 0 });
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount: cart.totalItems || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
