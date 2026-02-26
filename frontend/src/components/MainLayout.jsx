import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth.js';

const navItemClasses =
  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors';

const MainLayout = () => {
  const { auth, role } = useAuth();
  const isTeacher = role === 'faculty' || role === 'admin';

  return (
    <div className="min-h-screen flex bg-acosBg text-slate-100">
      <aside className="hidden md:flex w-64 flex-col border-r border-acosBorder/60 bg-slate-950/80 backdrop-blur-xl px-4 py-5">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 rounded-2xl bg-acosAccent flex items-center justify-center text-slate-950 font-bold">
            A
          </div>
          <div>
            <p className="font-display text-sm tracking-wide"> SMS </p>
            <p className="text-[11px] text-slate-400">
               Subject Management System
            </p>
          </div>
        </div>

        <div className="mb-6 text-xs text-slate-400">
          <p className="font-medium text-slate-200 mb-1">{auth?.user?.name}</p>
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
                      ? 'bg-acosAccent text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
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
                        ? 'bg-acosAccent text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
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
                  to="/activity"
                  className={({ isActive }) =>
                    `${navItemClasses} ${
                      isActive
                        ? 'bg-acosAccent text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <span>Activity</span>
                </NavLink>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `${navItemClasses} ${
                      isActive
                        ? 'bg-acosAccent text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
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
                        ? 'bg-acosAccent text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
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
                      ? 'bg-acosAccent text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
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
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-acosBorder/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-acosAccent flex items-center justify-center text-slate-950 font-bold">
              A
            </div>
            <div>
              <p className="font-display text-sm tracking-wide">ACOS</p>
              <p className="text-[11px] text-slate-400">Academic Subject Management System</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">{role}</span>
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

