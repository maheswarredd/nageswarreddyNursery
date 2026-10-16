import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Sparkles, X, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDateTime } from '../utils/formatters';

const NotificationCenter = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, enableWebPush } = useNotifications();
  const [pushStatus, setPushStatus] = useState(null);

  const handleEnablePush = async () => {
    const res = await enableWebPush();
    if (res.success) {
      setPushStatus('Web push notifications enabled successfully!');
    } else {
      setPushStatus(res.reason === 'denied' ? 'Permission was denied in browser.' : 'Push setup completed.');
    }
    setTimeout(() => setPushStatus(null), 4000);
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-forest-100 z-50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="bg-forest-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-forest-300" />
          <h3 className="font-bold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-forest-200 hover:text-white flex items-center gap-1 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all
            </button>
          )}
          <button onClick={onClose} className="text-forest-300 hover:text-white p-1 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Push Notification Banner */}
      <div className="bg-forest-50 p-3 border-b border-forest-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-forest-900">
          <Sparkles className="w-4 h-4 text-forest-700 flex-shrink-0" />
          <span>Get real-time delivery alerts on your phone or desktop.</span>
        </div>
        <button
          onClick={handleEnablePush}
          className="px-2.5 py-1 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg flex-shrink-0 transition"
        >
          Enable
        </button>
      </div>

      {pushStatus && (
        <div className="p-2 bg-emerald-100 text-emerald-800 text-xs text-center font-medium">
          {pushStatus}
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
            <p className="font-medium text-gray-600">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll alert you here when your plants ship!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => markAsRead(notif._id)}
              className={`p-3.5 hover:bg-forest-50/50 transition cursor-pointer flex gap-3 ${
                !notif.isRead ? 'bg-forest-50/30' : ''
              }`}
            >
              <div className="pt-0.5">
                {!notif.isRead ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-600 block mt-1" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200 block mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">
                  {notif.title}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-400">
                  <span>{formatDateTime(notif.createdAt)}</span>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={onClose}
                      className="text-forest-700 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
