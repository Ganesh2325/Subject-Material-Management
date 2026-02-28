import React from 'react';

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          Stay on top of new materials, announcements and updates.
        </p>
      </header>

      <section className="acos-card px-4 py-4">
        <p className="acos-meta">
          You have no notifications yet. When new activity happens in your
          subjects, it will appear here.
        </p>
      </section>
    </div>
  );
};

export default NotificationsPage;

