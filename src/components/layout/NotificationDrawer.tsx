import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { X, CheckCheck, Bell, AlertTriangle, CheckCircle, GraduationCap, LifeBuoy } from 'lucide-react';
import { InAppNotification } from '../../types/erp';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useERP();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen || !currentUser) return null;

  const userNotifications = notifications.filter(
    (n) => n.recipientUserId === currentUser.id || n.recipientUserId === 'usr-all'
  );

  const filtered = userNotifications.filter((n) => (filter === 'UNREAD' ? !n.isRead : true));
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: InAppNotification['category']) => {
    switch (category) {
      case 'ATTENDANCE_WARNING':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'CORRECTION_STATUS':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'EXAM_UPDATE':
      case 'RESULT_PUBLISHED':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'COMPLAINT_UPDATE':
        return <LifeBuoy className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/30 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Persistent institutional notices</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsAsRead(currentUser.id)}
                  className="p-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'UNREAD' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications found in this view.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-4 transition-colors cursor-pointer ${
                    item.isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">{item.title}</span>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="font-mono">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
