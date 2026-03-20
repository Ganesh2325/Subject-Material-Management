import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role
      });
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
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

        <form onSubmit={onSubmit} className="space-y-3">
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
            <p className="text-xs text-red-500 mt-1" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-green-500 mt-1 font-medium" role="alert">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="acos-button-primary w-full mt-2"
            disabled={loading || !!success}
          >
            {loading ? 'Please wait...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-acad-muted">
          <span>Already registered?</span>
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-600 underline transition-colors duration-200 ease-soft-out"
          >
            Go to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
