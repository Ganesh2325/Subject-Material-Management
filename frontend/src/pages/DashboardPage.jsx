import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const teacherDashboardQuery = async () => {
  const res = await client.get('/dashboard/teacher');
  return res.data;
};

const studentDashboardQuery = async () => {
  const res = await client.get('/dashboard/student');
  return res.data;
};

const TeacherDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: teacherDashboardQuery
  });

  const summary = data?.summary || {
    totalSubjects: 0,
    totalUnits: 0,
    totalMaterials: 0,
    totalMaterialViews: 0
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Subjects assigned</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalSubjects}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Units created</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalUnits}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Materials uploaded</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalMaterials}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Student views</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalMaterialViews}
          </p>
        </article>
      </section>
    </div>
  );
};

const StudentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: studentDashboardQuery
  });

  const subjects = data?.subjects || [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">My subjects</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : subjects.length}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="acos-meta mb-1">Units completed</p>
          <p className="text-2xl font-semibold">
            {isLoading
              ? '—'
              : subjects.reduce(
                  (sum, s) => sum + (s.stats?.completedUnits || 0),
                  0
                )}
          </p>
        </article>
      </section>

      <section className="acos-card px-4 py-4">
        <h2 className="section-title mb-3">Subject progress</h2>
        {isLoading && (
          <p className="acos-meta">Calculating your progress...</p>
        )}
        {!isLoading && subjects.length === 0 && (
          <p className="acos-meta">
            No subjects available yet. Once your faculty adds subjects, your
            progress will appear here.
          </p>
        )}
        {!isLoading && subjects.length > 0 && (
          <ul className="space-y-3 text-xs">
            {subjects.map((s) => (
              <li key={s._id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-acad-text dark:text-slate-100 font-medium">
                    {s.name}{' '}
                    <span className="acos-meta">
                      ({s.code})
                    </span>
                  </p>
                  <p className="acos-meta">
                    {s.stats?.completedUnits || 0}/{s.stats?.totalUnits || 0}{' '}
                    units • {s.stats?.progress || 0}%
                  </p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-acosAccent"
                    style={{ width: `${s.stats?.progress || 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const DashboardPage = () => {
  const { auth, role } = useAuth();

  const isTeacher = role === 'faculty' || role === 'admin';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="page-title">
          Welcome back, {auth?.user?.name}
        </h1>
        <p className="page-subtitle">
          You are signed in as <span className="font-medium">{role}</span>.
        </p>
      </header>

      {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default DashboardPage;

