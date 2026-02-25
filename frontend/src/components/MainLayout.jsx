import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth.js';

const navItemClasses =
  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors';

const MainLayout = () => {
  const { auth, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-acosBg text-slate-100">
      <aside className="hidden md:flex w-64 flex-col border-r border-acosBorder/60 bg-slate-950/80 backdrop-blur-xl px-4 py-5">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 rounded-2xl bg-acosAccent flex items-center justify-center text-slate-950 font-bold">
            A
          </div>
          <div>
            <p className="font-display text-sm tracking-wide">ACOS</p>
            <p className="text-[11px] text-slate-400">
              Academic Content OS
            </p>
          </div>
        </div>

        <div className="mb-6 text-xs text-slate-400">
          <p className="font-medium text-slate-200 mb-1">{auth?.user?.name}</p>
          <p>Role: {role}</p>
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `${navItemClasses} ${
                isActive
                  ? 'bg-acosAccent text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/subjects"
            className={({ isActive }) =>
              `${navItemClasses} ${
                isActive
                  ? 'bg-acosAccent text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <span>Subjects</span>
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `${navItemClasses} ${
                isActive
                  ? 'bg-acosAccent text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <span>Search</span>
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 text-xs text-slate-400 hover:text-red-300 text-left"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-acosBorder/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-acosAccent flex items-center justify-center text-slate-950 font-bold">
              A
            </div>
            <div>
              <p className="font-display text-sm tracking-wide">ACOS</p>
              <p className="text-[11px] text-slate-400">Academic Content OS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-300"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

