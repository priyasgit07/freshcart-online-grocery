import React from 'react';
import { Bell, CheckCheck, Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Real-time alerts for your orders, status changes, and store events</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            You'll receive alerts here when orders are placed, updated, or shipped.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-emerald-50/50 border-emerald-200 shadow-sm text-slate-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  n.read ? 'bg-slate-100 text-slate-500' : 'bg-brand-500 text-white shadow-sm'
                }`}>
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                    {n.message}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-xs text-brand-600 hover:text-brand-800 font-semibold shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
