import React from 'react';

const AnnouncementsPage = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">
          Course-wide updates, exam announcements and important reminders.
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        <p className="acos-meta">No announcements have been posted yet.</p>
      </section>
    </div>
  );
};

export default AnnouncementsPage;

