import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    if (isAuthenticated) {
      const interval = setInterval(fetchNotifications, 15000); // 15s polling
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, isAuthenticated]);

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
