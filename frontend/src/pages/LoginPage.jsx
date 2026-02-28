import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ initialMode = 'login', hideModeToggle = false }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/dashboard', { replace: true });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role
        });
        // After successful signup, send user to login screen
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (mode === 'login' ? 'Login failed' : 'Registration failed');
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md auth-card px-6 py-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold shadow-md">
            A
          </div>
          <div>
            <p className="font-display text-base tracking-wide text-acad-text">
              Subject Management System
            </p>
            <p className="acos-meta">Role-based academic content platform</p>
          </div>
        </div>

        {!hideModeToggle && (
          <div className="flex gap-2 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-full border text-xs transition-colors-transform duration-200 ease-soft-out ${
              mode === 'login'
                ? 'bg-primary-500 text-white border-transparent shadow-sm'
                : 'border-acad-border text-acad-muted hover:bg-primary-100 hover:text-primary-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-full border text-xs transition-colors-transform duration-200 ease-soft-out ${
              mode === 'register'
                ? 'bg-primary-500 text-white border-transparent shadow-sm'
                : 'border-acad-border text-acad-muted hover:bg-primary-100 hover:text-primary-600'
            }`}
          >
            Register
          </button>
          </div>
        )}

        {mode === 'register' && (
          <div className="mb-4">
            <p className="acos-meta mb-1">Choose your role.</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-acad-bg border border-acad-border px-1 py-1">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`px-3 py-1 rounded-full text-xs transition-colors-transform duration-200 ease-soft-out ${
                  role === 'student'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-acad-muted hover:bg-primary-100 hover:text-primary-600'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('faculty')}
                className={`px-3 py-1 rounded-full text-xs transition-colors-transform duration-200 ease-soft-out ${
                  role === 'faculty'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-acad-muted hover:bg-primary-100 hover:text-primary-600'
                }`}
              >
                Faculty
              </button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs mb-1 text-acad-muted">
                Full name
              </label>
              <input
                name="name"
                className="acos-input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs mb-1 text-acad-muted">Email</label>
            <input
              name="email"
              type="email"
              className="acos-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-acad-muted">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="acos-input"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="acos-button-primary w-full mt-2"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Create account'}
          </button>
        </form>

        {!hideModeToggle && (
          <div className="mt-4 flex items-center justify-between text-xs text-acad-muted">
            <span>
              {mode === 'login' ? 'No account?' : 'Already registered?'}
            </span>
            {mode === 'login' ? (
              <button
                type="button"
                className="text-primary-500 hover:text-primary-600 underline transition-colors duration-200 ease-soft-out"
                onClick={() => setMode('register')}
              >
                Create an Account
              </button>
            ) : (
              <button
                type="button"
                className="text-primary-500 hover:text-primary-600 underline transition-colors duration-200 ease-soft-out"
                onClick={() => setMode('login')}
              >
                Go to login
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;

