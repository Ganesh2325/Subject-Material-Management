import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';

const fetchStudentDashboard = async () => {
  const res = await client.get('/dashboard/student');
  return res.data;
};

const BookmarksPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: fetchStudentDashboard
  });

  const bookmarks = data?.bookmarks || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl text-slate-50">Bookmarks</h1>
        <p className="text-xs text-slate-400">
          Quick access to all materials you have saved.
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        {isLoading && (
          <p className="text-xs text-slate-500">Loading bookmarked materials…</p>
        )}
        {!isLoading && bookmarks.length === 0 && (
          <p className="text-xs text-slate-500">
            You have not bookmarked any materials yet.
          </p>
        )}
        {!isLoading && bookmarks.length > 0 && (
          <ul className="space-y-2 text-xs max-h-[420px] overflow-y-auto pr-1">
            {bookmarks.map((bm) => (
              <li
                key={bm._id}
                className="rounded-lg border border-acosBorder/60 px-3 py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-slate-100 font-medium truncate">
                    {bm.materialTitle || 'Material'}
                  </p>
                  {bm.subjectName && (
                    <p className="text-[11px] text-slate-500 truncate">
                      {bm.subjectName}
                      {bm.unitTitle ? ` • ${bm.unitTitle}` : ''}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-slate-600">
                  {new Date(bm.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default BookmarksPage;

