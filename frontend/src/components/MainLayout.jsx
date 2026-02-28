import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth.js';

const navItemClasses =
  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors-transform duration-200 ease-soft-out';

const MainLayout = () => {
  const { auth, role } = useAuth();
  const isTeacher = role === 'faculty' || role === 'admin';

  return (
    <div className="min-h-screen flex bg-acad-bg text-acad-text dark:bg-transparent dark:text-slate-100">
      <aside className="hidden md:flex w-64 flex-col border-r border-acad-border bg-acad-sidebar px-4 py-5">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold shadow-md">
            A
          </div>
          <div>
            <p className="font-display text-sm tracking-wide text-white">SMS</p>
            <p className="text-[11px] text-slate-400">
              Subject Management System
            </p>
          </div>
        </div>

        <div className="mb-6 text-xs text-slate-400">
          <p className="font-medium text-slate-100 mb-1">{auth?.user?.name}</p>
          <p>Role: {role}</p>
        </div>

        <nav className="flex-1 space-y-4 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Main
            </p>
            <div className="space-y-1">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `${navItemClasses} ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-200 hover:bg-primary-600/30'
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
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-200 hover:bg-primary-600/30'
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
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-200 hover:bg-primary-600/30'
                  }`
                }
              >
                <span>Search</span>
              </NavLink>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Academics
            </p>
            <div className="space-y-1">
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `${navItemClasses} ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-200 hover:bg-primary-600/30'
                  }`
                }
              >
                <span>Calendar</span>
              </NavLink>
              {!isTeacher && (
                <NavLink
                  to="/progress"
                  className={({ isActive }) =>
                    `${navItemClasses} ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-slate-200 hover:bg-primary-600/30'
                    }`
                  }
                >
                  <span>Progress</span>
                </NavLink>
              )}
            </div>
          </div>

          {isTeacher && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                Insights
              </p>
              <div className="space-y-1">
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `${navItemClasses} ${
                      isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-200 hover:bg-primary-600/30'
                    }`
                  }
                >
                  <span>Analytics</span>
                </NavLink>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Personal
            </p>
            <div className="space-y-1">
              {!isTeacher && (
                <NavLink
                  to="/bookmarks"
                  className={({ isActive }) =>
                    `${navItemClasses} ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-slate-200 hover:bg-primary-600/30'
                    }`
                  }
                >
                  <span>Bookmarks</span>
                </NavLink>
              )}
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `${navItemClasses} ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-200 hover:bg-primary-600/30'
                  }`
                }
              >
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-acad-border bg-acad-sidebar">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <div>
              <p className="font-display text-sm tracking-wide text-white">ACOS</p>
              <p className="text-[11px] text-slate-400">
                Academic Subject Management System
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">{role}</span>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 bg-acad-bg dark:bg-transparent">
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

