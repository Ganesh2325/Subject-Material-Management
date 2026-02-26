import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchTeacherRequests = async () => {
  const res = await client.get('/material-requests/pending');
  return res.data;
};

const fetchStudentRequests = async () => {
  const res = await client.get('/dashboard/student');
  return res.data.recentRequests || [];
};

const RequestsPage = () => {
  const { role } = useAuth();
  const isTeacher = role === 'faculty' || role === 'admin';

  const { data, isLoading } = useQuery({
    queryKey: ['requests', isTeacher ? 'teacher' : 'student'],
    queryFn: isTeacher ? fetchTeacherRequests : fetchStudentRequests
  });

  const requests = isTeacher ? data || [] : data || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl text-slate-50">Requests</h1>
        <p className="text-xs text-slate-400">
          {isTeacher
            ? 'Review material requests from your students.'
            : 'Track the status of materials you have requested.'}
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        {isLoading && (
          <p className="text-xs text-slate-500">Loading requests…</p>
        )}
        {!isLoading && requests.length === 0 && (
          <p className="text-xs text-slate-500">
            {isTeacher
              ? 'There are no requests at the moment.'
              : 'You have not requested any materials yet.'}
          </p>
        )}
        {!isLoading && requests.length > 0 && (
          <ul className="space-y-2 text-xs">
            {requests.map((req) => (
              <li
                key={req._id}
                className="rounded-lg border border-acosBorder/60 px-3 py-2"
              >
                <p className="text-slate-100 font-medium">
                  {req.requestedTitle || 'Material request'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Status: {req.status || 'pending'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default RequestsPage;

