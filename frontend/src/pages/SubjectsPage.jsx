import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchSubjects = async () => {
  const res = await client.get('/subjects');
  return res.data;
};

const createSubjectApi = async (payload) => {
  const res = await client.post('/subjects', payload);
  return res.data;
};

const SubjectsPage = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const [form, setForm] = useState({
    name: '',
    code: '',
    semester: ''
  });
  const [error, setError] = useState('');

  const canManage = role === 'admin' || role === 'faculty';

  const createMutation = useMutation({
    mutationFn: createSubjectApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setForm({ name: '', code: '', semester: '' });
      setError('');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Create failed';
      setError(msg);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg text-slate-50">Subjects</h1>
          <p className="text-xs text-slate-400">
            Browse all subjects in the Academic Content OS.
          </p>
        </div>
      </header>

      {canManage && (
        <section className="acos-card px-4 py-4">
          <p className="text-xs text-slate-300 mb-2 font-medium">
            Add subject ( faculty)
          </p>
          <form
            onSubmit={onSubmit}
            className="grid gap-3 md:grid-cols-[2fr,1.2fr,1.2fr,auto] items-end"
          >
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Name
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
              <label className="block text-[11px] text-slate-400 mb-1">
                Code
              </label>
              <input
                name="code"
                className="acos-input"
                value={form.code}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Semester
              </label>
              <input
                name="semester"
                className="acos-input"
                value={form.semester}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="acos-button-primary text-xs"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Saving…' : 'Add'}
            </button>
          </form>
          {error && (
            <p className="text-[11px] text-red-400 mt-2" role="alert">
              {error}
            </p>
          )}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-xs text-slate-400">Loading…</p>}
        {!isLoading && subjects.length === 0 && (
          <p className="text-xs text-slate-400">No subjects yet.</p>
        )}
        {subjects.map((subject) => (
          <motion.article
            key={subject._id}
            className="acos-card px-4 py-4 flex flex-col justify-between"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div>
              <p className="text-[11px] text-slate-400 mb-1">{subject.code}</p>
              <h2 className="text-sm font-semibold text-slate-50 mb-1.5">
                {subject.name}
              </h2>
              <p className="text-[11px] text-slate-400 mb-1">
                Semester {subject.semester}
              </p>
              <p className="text-[11px] text-slate-500">
                {subject.units?.length || 0} units •{' '}
                {subject.units
                  ? subject.units.reduce(
                      (sum, u) => sum + (u.materials ? u.materials.length : 0),
                      0
                    )
                  : 0}{' '}
                materials
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <Link
                to={`/subjects/${subject._id}`}
                className="text-[11px] text-acosAccent hover:text-acosAccentSoft underline"
              >
                Open subject
              </Link>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
};

export default SubjectsPage;

