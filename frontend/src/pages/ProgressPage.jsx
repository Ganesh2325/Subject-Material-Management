import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';

const fetchStudentDashboard = async () => {
  const res = await client.get('/dashboard/student');
  return res.data;
};

const ProgressPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: fetchStudentDashboard
  });

  const subjects = data?.subjects || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl text-slate-50">Progress</h1>
        <p className="text-xs text-slate-400">
          Track how much of each subject you have completed.
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        {isLoading && (
          <p className="text-xs text-slate-500">Calculating your progress…</p>
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

export default ProgressPage;

