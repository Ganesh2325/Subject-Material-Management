import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchSubjects = async () => {
  const res = await client.get('/subjects');
  return res.data;
};

const DashboardPage = () => {
  const { auth, role } = useAuth();
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const totalSubjects = subjects.length;
  const totalUnits = subjects.reduce(
    (sum, s) => sum + (s.units ? s.units.length : 0),
    0
  );
  const totalMaterials = subjects.reduce(
    (sum, s) =>
      sum +
      (s.units
        ? s.units.reduce(
            (inner, u) => inner + (u.materials ? u.materials.length : 0),
            0
          )
        : 0),
    0
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-xl text-slate-50">
          Welcome back, {auth?.user?.name}
        </h1>
        <p className="text-xs text-slate-400">
          You are signed in as <span className="font-medium">{role}</span>.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Subjects</p>
          <p className="text-2xl font-semibold">{isLoading ? '—' : totalSubjects}</p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Units</p>
          <p className="text-2xl font-semibold">{isLoading ? '—' : totalUnits}</p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Materials</p>
          <p className="text-2xl font-semibold">{isLoading ? '—' : totalMaterials}</p>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;

