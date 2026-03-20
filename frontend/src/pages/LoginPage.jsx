import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Login failed';
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

        <form onSubmit={onSubmit} className="space-y-3">
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
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-acad-muted">
          <span>Don't have an account?</span>
          <Link
            to="/signup"
            className="text-primary-500 hover:text-primary-600 underline transition-colors duration-200 ease-soft-out"
          >
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
