'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Bell, X, CheckCheck, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { notificationAPI } from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'CLAIMED' | 'STATUS_UPDATE' | 'COMPLETED' | string;
  timestamp: string;
}

const NOTIF_ICON: Record<string, string> = {
  CLAIMED:       '🎉',
  STATUS_UPDATE: '🚀',
  COMPLETED:     '❤️',
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showPanel, setShowPanel]         = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread]               = useState(0);
  const [loading, setLoading]             = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  // Load notifications when panel opens
  useEffect(() => {
    if (!showPanel || !user || !user.id) return;
    setLoading(true);
    notificationAPI.getNotifications(user.id)
      .then(res => {
        setNotifications(res.data || []);
        setUnread(0); // mark as read on open
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [showPanel, user]);

  // Poll for unread count every 30s
  useEffect(() => {
    if (!user || !user.id) return;
    const check = async () => {
      try {
        const res = await notificationAPI.getNotifications(user.id);
        setUnread(res.data?.length || 0);
      } catch { /* offline — ignore */ }
    };
    check();
    const timer = setInterval(check, 30_000);
    return () => clearInterval(timer);
  }, [user]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPanel]);

  if (isAuthPage) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14" style={{ background: 'rgba(5,9,20,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
              <Leaf className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base tracking-tight gradient-text">FoodRescue</span>
          </Link>

          {/* Right */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-dark-500 font-mono uppercase tracking-wider">Welcome back</p>
                <p className="text-xs font-semibold text-white leading-none">{user.fullName?.split(' ')[0]}</p>
              </div>

              {/* Notification bell */}
              <button
                onClick={() => setShowPanel(p => !p)}
                className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
              >
                <Bell className="w-4 h-4 text-dark-400" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-400 text-dark-950 text-[9px] font-black flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Logout button */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                  }
                  logout();
                }}
                className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition cursor-pointer ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-dark-300 hover:text-white transition font-medium">Login</Link>
              <Link href="/signup" className="px-4 py-1.5 bg-gradient-primary text-dark-950 text-sm font-bold rounded-xl shadow-glow-sm hover:shadow-glow transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Notification Panel */}
      {showPanel && (
        <div
          ref={panelRef}
          className="fixed top-16 right-4 z-50 w-80 animate-slide-up"
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          <div className="app-card-glow overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold text-sm">Notifications</h3>
                <p className="text-dark-500 text-[10px] font-mono">{notifications.length} total</p>
              </div>
              <button onClick={() => setShowPanel(false)} className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center text-dark-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
                  <p className="text-dark-500 text-xs">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 flex flex-col items-center gap-2 text-center">
                  <CheckCheck className="w-8 h-8 text-dark-700" />
                  <p className="text-dark-400 text-sm font-medium">All caught up!</p>
                  <p className="text-dark-600 text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 border-b border-white/4 hover:bg-white/3 transition">
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{NOTIF_ICON[n.type] || '🔔'}</span>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold leading-snug">{n.title}</p>
                        <p className="text-dark-400 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-dark-600 text-[10px] font-mono mt-1">
                          {new Date(n.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
