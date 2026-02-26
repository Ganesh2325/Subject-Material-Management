import React from 'react';

const AnnouncementsPage = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl text-slate-50">Announcements</h1>
        <p className="text-xs text-slate-400">
          Course-wide updates, exam announcements and important reminders.
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        <p className="text-xs text-slate-500">
          No announcements have been posted yet.
        </p>
      </section>
    </div>
  );
};

export default AnnouncementsPage;

