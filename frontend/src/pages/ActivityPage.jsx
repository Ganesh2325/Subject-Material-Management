import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';

const fetchTeacherDashboard = async () => {
  const res = await client.get('/dashboard/teacher');
  return res.data;
};

const ActivityPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: fetchTeacherDashboard
  });

  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl text-slate-50">Activity</h1>
        <p className="text-xs text-slate-400">
          Recent actions across your subjects, units and materials.
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        {isLoading && (
          <p className="text-xs text-slate-500">Loading recent activity…</p>
        )}
        {!isLoading && activities.length === 0 && (
          <p className="text-xs text-slate-500">
            You have no recent activity yet.
          </p>
        )}
        {!isLoading && activities.length > 0 && (
          <ul className="space-y-2 text-xs">
            {activities.map((activity) => (
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
      </section>
    </div>
  );
};

export default ActivityPage;

