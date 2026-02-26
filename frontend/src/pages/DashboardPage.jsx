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
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: teacherDashboardQuery
  });

  const resolveRequestMutation = useMutation({
    mutationFn: async (id) => {
      const res = await client.patch(`/material-requests/${id}/resolve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'teacher'] });
    }
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
          <p className="text-[11px] text-slate-400 mb-1">Subjects assigned</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalSubjects}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Units created</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalUnits}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Materials uploaded</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalMaterials}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Student views</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : summary.totalMaterialViews}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <motion.article
          className="acos-card px-4 py-4 lg:col-span-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Pending material requests
            </h2>
          </div>
          {isLoading && (
            <p className="text-xs text-slate-500">Loading requests...</p>
          )}
          {!isLoading && (!data?.pendingRequests || data.pendingRequests.length === 0) && (
            <p className="text-xs text-slate-500">
              No pending requests from students.
            </p>
          )}
          {!isLoading && data?.pendingRequests && data.pendingRequests.length > 0 && (
            <ul className="space-y-2 text-xs">
              {data.pendingRequests.map((req) => (
                <li
                  key={req._id}
                  className="rounded-lg border border-acosBorder/60 px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-slate-100 font-medium truncate">
                      {req.requestedTitle}
                    </p>
                    <p className="text-slate-400">
                      {req.student?.name} • {req.subject?.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resolveRequestMutation.mutate(req._id)}
                    className="text-[11px] px-2 py-1 rounded-lg border border-emerald-500/70 text-emerald-300 hover:bg-emerald-950/40"
                    disabled={resolveRequestMutation.isPending}
                  >
                    Mark resolved
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.article>

        <motion.article
          className="acos-card px-4 py-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Recent activity
            </h2>
          </div>
          {isLoading && (
            <p className="text-xs text-slate-500">Loading activity...</p>
          )}
          {!isLoading &&
            (!data?.recentActivities || data.recentActivities.length === 0) && (
              <p className="text-xs text-slate-500">
                You have no recent activity yet.
              </p>
            )}
          {!isLoading && data?.recentActivities && data.recentActivities.length > 0 && (
            <ul className="space-y-2 text-xs">
              {data.recentActivities.map((activity) => (
                <li key={activity._id} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-acosAccent" />
                  <div>
                    <p className="text-slate-100">
                      {activity.type === 'subject_created' && 'You created a subject'}
                      {activity.type === 'unit_added' && 'You added a unit'}
                      {activity.type === 'material_added' && 'You added material'}
                      {activity.type === 'material_viewed' &&
                        'Students viewed your material'}
                      {activity.type === 'material_requested' &&
                        'Student requested new material'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.article>
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
          <p className="text-[11px] text-slate-400 mb-1">My subjects</p>
          <p className="text-2xl font-semibold">
            {isLoading ? '—' : subjects.length}
          </p>
        </article>
        <article className="acos-card px-4 py-3">
          <p className="text-[11px] text-slate-400 mb-1">Units completed</p>
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
        <h2 className="text-sm font-semibold text-slate-100 mb-3">
          Subject progress
        </h2>
        {isLoading && (
          <p className="text-xs text-slate-500">Calculating your progress...</p>
        )}
        {!isLoading && subjects.length === 0 && (
          <p className="text-xs text-slate-500">
            No subjects available yet. Once your faculty adds subjects, your
            progress will appear here.
          </p>
        )}
        {!isLoading && subjects.length > 0 && (
          <ul className="space-y-3 text-xs">
            {subjects.map((s) => (
              <li key={s._id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-slate-100 font-medium">
                    {s.name}{' '}
                    <span className="text-[11px] text-slate-500">
                      ({s.code})
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {s.stats?.completedUnits || 0}/{s.stats?.totalUnits || 0}{' '}
                    units • {s.stats?.progress || 0}%
                  </p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
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
        <h1 className="font-display text-xl text-slate-50">
          Welcome back, {auth?.user?.name}
        </h1>
        <p className="text-xs text-slate-400">
          You are signed in as <span className="font-medium">{role}</span>.
        </p>
      </header>

      {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default DashboardPage;

