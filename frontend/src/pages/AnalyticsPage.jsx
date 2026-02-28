import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';

const fetchTeacherDashboard = async () => {
  const res = await client.get('/dashboard/teacher');
  return res.data;
};

const AnalyticsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: fetchTeacherDashboard
  });

  const summary = data?.summary || {
    totalSubjects: 0,
    totalUnits: 0,
    totalMaterials: 0,
    totalMaterialViews: 0
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          High level engagement across your subjects and materials.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Subjects</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalSubjects}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Units</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalUnits}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Materials</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalMaterials}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Total views</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalMaterialViews}
          </p>
        </article>
      </section>

      <section className="acos-card px-4 py-4">
        <p className="acos-meta">
          Detailed per-material analytics can be added here, such as most and
          least viewed materials and engagement over time.
        </p>
      </section>
    </div>
  );
};

export default AnalyticsPage;

