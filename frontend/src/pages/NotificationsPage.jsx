import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';

const fetchNotifications = async () => {
  const res = await client.get('/notifications');
  return res.data;
};

const getIconForType = (type) => {
  switch (type) {
    case 'material_added':
      return '📄';
    case 'request_approved':
      return '✅';
    case 'request_rejected':
      return '❌';
    case 'announcement_posted':
      return '📢';
    case 'reminder':
      return '⏱️';
    default:
      return '🔔';
  }
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => client.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => client.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-3xl mx-auto space-y-6"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title mb-0">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="page-subtitle mt-1">
            Stay on top of new materials, announcements, and updates.
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-md">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-medium rounded transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 font-medium rounded transition-all ${filter === 'unread' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Unread
            </button>
          </div>
          <button 
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Mark all read
          </button>
        </div>
      </header>

      <section className="acos-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500 animate-pulse">Loading notifications...</div>
        )}
        {error && (
          <div className="p-8 text-center text-sm text-rose-500">Failed to load notifications.</div>
        )}

        {!isLoading && !error && displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <span className="text-5xl mb-4 grayscale opacity-40">📭</span>
            <p className="text-slate-500 font-medium font-display text-lg">You're all caught up!</p>
            <p className="text-xs text-slate-400 mt-2">When new activity happens, it will appear here.</p>
          </div>
        ) : (
          <div className="relative p-6 px-4 sm:px-8">
            <div className="absolute left-10 top-8 bottom-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <ul className="space-y-6 relative z-10">
              <AnimatePresence>
                {displayedNotifications.map((notif) => (
                  <motion.li 
                    key={notif._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    className="group"
                  >
                    <div className="flex gap-4 sm:gap-6 items-start">
                      {/* Icon Badge */}
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm z-10 
                        ${notif.isRead 
                          ? 'bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 grayscale opacity-60' 
                          : 'bg-primary-100 border border-primary-200 dark:bg-primary-900/60 dark:border-primary-800 ring-4 ring-white dark:ring-slate-900'}`}
                      >
                        <span className="text-sm sm:text-base">{getIconForType(notif.type)}</span>
                      </div>

                      {/* Content Card */}
                      <div className={`flex-1 rounded-xl p-4 transition-all duration-200 border 
                        ${notif.isRead 
                          ? 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50' 
                          : 'bg-blue-50/50 dark:bg-slate-800/80 border-blue-100 dark:border-slate-700 shadow-sm'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                          <h3 className={`font-semibold text-sm sm:text-base ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                        
                        <p className={`text-xs sm:text-sm leading-relaxed ${notif.isRead ? 'text-slate-500/80 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.message}
                        </p>

                        {!notif.isRead && (
                          <div className="mt-3 flex justify-end">
                            <button 
                              onClick={() => markReadMutation.mutate(notif._id)}
                              disabled={markReadMutation.isPending}
                              className="text-[10px] uppercase tracking-wider font-bold text-primary-600 hover:text-primary-800 bg-white dark:bg-slate-900 border border-primary-200 dark:border-primary-800 px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
                            >
                              Mark as read
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default NotificationsPage;
