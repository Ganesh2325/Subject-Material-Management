import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchFacultyAnalytics = async () => {
  const res = await client.get('/analytics/faculty');
  return res.data;
};

const fetchStudentAnalytics = async () => {
  const res = await client.get('/analytics/student');
  return res.data;
};

const StatCard = ({ title, value }) => (
  <article className="acos-card px-4 py-3 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
    <p className="acos-meta mb-1 uppercase tracking-wider text-[10px]">{title}</p>
    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{value ?? '—'}</p>
  </article>
);

const FacultyAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'faculty'],
    queryFn: fetchFacultyAnalytics
  });

  if (isLoading) return <p className="acos-meta mt-4 animate-pulse">Loading teaching analytics...</p>;
  if (error) return <p className="text-red-500 mt-4 text-sm">Failed to load analytics: {error.message}</p>;

  const { overview, engagement, requests, trends } = data;

  return (
    <div className="space-y-6 mt-4">
      {/* 1) Teaching Overview Cards */}
      <section>
        <h2 className="text-sm font-semibold text-acad-text mb-3">Teaching Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Subjects Handled" value={overview?.totalSubjects} />
          <StatCard title="Total Units" value={overview?.totalUnits} />
          <StatCard title="Total Materials" value={overview?.totalMaterials} />
          <StatCard title="Student Views" value={overview?.totalStudentViews} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2) Engagement Insights */}
        <section className="acos-card px-5 py-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-acad-text mb-4">Engagement Insights</h2>
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-primary-600 mb-1">Most Viewed Material</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{engagement?.mostViewed?.title || 'No materials viewed'}</p>
              {engagement?.mostViewed && (
                <p className="text-xs text-slate-500 mt-1">{engagement.mostViewed.views} views • {engagement.mostViewed.subjectName}</p>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Least Viewed Material</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{engagement?.leastViewed?.title || 'No materials viewed'}</p>
              {engagement?.leastViewed && (
                <p className="text-xs text-slate-500 mt-1">{engagement.leastViewed.views} views • {engagement.leastViewed.subjectName}</p>
              )}
            </div>
          </div>
        </section>

        {/* 4) Request Statistics */}
        <section className="acos-card px-5 py-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <h2 className="text-sm font-semibold text-acad-text mb-4">Material Requests</h2>
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="bg-orange-50/80 dark:bg-orange-950/20 rounded-lg p-4 flex flex-col justify-center items-center border border-orange-100 dark:border-orange-900/30">
              <p className="text-xs text-orange-600 dark:text-orange-500 mb-1 font-semibold uppercase tracking-wide">Pending</p>
              <p className="text-4xl font-bold text-orange-700 dark:text-orange-400 mt-2">{requests?.pending || 0}</p>
            </div>
            <div className="bg-emerald-50/80 dark:bg-emerald-950/20 rounded-lg p-4 flex flex-col justify-center items-center border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mb-1 font-semibold uppercase tracking-wide">Resolved</p>
              <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">{requests?.resolved || 0}</p>
            </div>
          </div>
        </section>
      </div>

      {/* 3) Trends */}
      <section className="acos-card px-5 py-5 border border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-acad-text mb-4">Upload Trends (Last 7 Days)</h2>
        {trends?.recentUploads?.length > 0 ? (
          <ul className="space-y-3">
            {trends.recentUploads.map((t, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0 border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t._id}</span>
                <span className="font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-xs">
                  {t.count} items uploaded
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 italic">No uploads recorded in the last 7 days.</p>
        )}
      </section>
    </div>
  );
};

const StudentAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'student'],
    queryFn: fetchStudentAnalytics
  });

  if (isLoading) return <p className="acos-meta mt-4 animate-pulse">Loading learning analytics...</p>;
  if (error) return <p className="text-red-500 mt-4 text-sm">Failed to load analytics: {error.message}</p>;

  const { progress, activity, weakAreas } = data;

  return (
    <div className="space-y-6 mt-4">
      {/* 1) Learning Progress */}
      <section>
        <h2 className="text-sm font-semibold text-acad-text mb-3">Learning Progress</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Subjects Active" value={progress?.subjectsEnrolled} />
          <StatCard title="Est. Units Visited" value={progress?.unitsCompleted} />
          <article className="acos-card px-4 py-4 flex flex-col justify-between shadow-sm">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-acad-muted mb-2">Overall Completion</p>
            <div className="flex items-center gap-4 mt-auto">
              <p className="text-3xl font-bold text-primary-600">{progress?.completionPercentage}%</p>
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700"
                  style={{ width: `${progress?.completionPercentage || 0}%` }}
                />
              </div>
            </div>
          </article>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2) Activity Stats & Recent Summary */}
        <section className="acos-card px-5 py-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-acad-text mb-4">Learning Activity</h2>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Materials Viewed</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{activity?.materialsViewed}</p>
            </div>
            <div className="flex-1 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 text-center border border-amber-100/50 dark:border-amber-900/30 shadow-sm">
              <p className="text-xs text-amber-600 dark:text-amber-500 uppercase tracking-widest font-semibold mb-2">Bookmarks</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{activity?.bookmarksCount}</p>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Actions</h3>
            {activity?.recentActivity?.length > 0 ? (
              <ul className="space-y-3">
                {activity.recentActivity.map((log, i) => (
                  <li key={i} className="text-sm py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded transition-colors -mx-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium capitalize flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 block" />
                      {log.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{log.subject?.name || 'General'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No recent activity found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const { role } = useAuth();
  const isTeacher = role === 'faculty' || role === 'admin';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Analytics & Insights
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          {isTeacher
            ? 'Access high-level engagement trends, monitor your teaching materials overhead, and manage pending academic requests.'
            : 'Track your learning velocity, review your recent academic activities, and discover areas recommending additional focus.'}
        </p>
      </header>

      {isTeacher ? <FacultyAnalytics /> : <StudentAnalytics />}
    </motion.div>
  );
};

export default AnalyticsPage;
