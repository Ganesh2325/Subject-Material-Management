import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const SettingsPage = () => {
  const { auth, role, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(auth?.user?.name || '');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('sms_theme');
    if (stored === 'light') return false;
    if (stored === 'dark') return true;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      window.localStorage.setItem('sms_theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('sms_theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl text-slate-50">Settings</h1>
        <p className="text-xs text-slate-400">
          Manage your profile, preferences and security.
        </p>
      </header>

      <section className="acos-card px-4 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Profile</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Name
            </label>
            <input
              className="acos-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Email
            </label>
            <input
              className="acos-input bg-slate-900/60"
              value={auth?.user?.email || ''}
              disabled
            />
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Role: <span className="font-medium">{role}</span>
        </p>
      </section>

      <section className="acos-card px-4 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Preferences</h2>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Dark mode</span>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full border border-acosBorder/70 transition-colors ${
              isDark ? 'bg-acosAccent' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                isDark ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      <section className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500 text-slate-950 hover:bg-red-400"
        >
          Logout
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;

