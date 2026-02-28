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
        <h1 className="font-display text-xl text-acad-text">Settings</h1>
        <p className="text-xs text-acad-muted">
          Manage your profile, preferences and security.
        </p>
      </header>

      <section className="acos-card px-4 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-acad-text">Profile</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="acos-label">Name</label>
            <input
              className="acos-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="acos-label">Email</label>
            <input
              className="acos-input"
              value={auth?.user?.email || ''}
              disabled
            />
          </div>
        </div>
        <p className="acos-meta">
          Role: <span className="font-medium">{role}</span>
        </p>
      </section>

      <section className="acos-card px-4 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-acad-text">Preferences</h2>
        <div className="flex items-center justify-between text-xs">
          <span className="text-acad-text">Dark mode</span>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full border border-acad-border transition-colors-transform duration-200 ease-soft-out ${
              isDark ? 'bg-primary-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-soft-out ${
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
          className="px-4 py-2 rounded-xl text-xs font-medium bg-acad-danger text-white hover:bg-red-700 transition-colors-transform duration-200 ease-soft-out shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;

