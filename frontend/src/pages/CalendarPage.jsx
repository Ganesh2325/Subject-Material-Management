import React, { useMemo, useState } from 'react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildMonthMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

const CalendarPage = () => {
  const today = useMemo(() => new Date(), []);
  const [current, setCurrent] = useState(() => new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const monthLabel = current.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });

  const cells = useMemo(
    () => buildMonthMatrix(year, month),
    [year, month]
  );

  const goPrevMonth = () => {
    setCurrent((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrent((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl text-acad-text">Calendar</h1>
          <p className="text-xs text-acad-muted">
            View upcoming exams, assignments and academic events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={goPrevMonth}
            className="px-2 py-1 rounded-lg border border-acad-border text-acad-text hover:bg-primary-100 hover:text-primary-600 transition-colors-transform duration-200 ease-soft-out"
          >
          &lt;
          </button>
          <p className="text-acad-text font-medium">{monthLabel}</p>
          <button
            type="button"
            onClick={goNextMonth}
            className="px-2 py-1 rounded-lg border border-acad-border text-acad-text hover:bg-primary-100 hover:text-primary-600 transition-colors-transform duration-200 ease-soft-out"
          >
            &gt;
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr,1.3fr]">
        <div className="acos-card px-4 py-4">
          <p className="acos-meta mb-2">Monthly view</p>
          <div className="grid grid-cols-7 gap-1 text-xs text-center">
            {dayNames.map((d) => (
              <div key={d} className="text-acad-muted dark:text-slate-300 py-1">
                {d}
              </div>
            ))}
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={idx} className="h-10 rounded-lg border border-acad-border/40 bg-slate-200/40" />
                );
              }

              const isToday =
                year === today.getFullYear() &&
                month === today.getMonth() &&
                day === today.getDate();

              return (
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={idx}
                  className={`h-10 rounded-lg border text-acad-text flex items-center justify-center ${
                    isToday
                      ? 'border-primary-500 bg-primary-100 font-semibold text-primary-700'
                      : 'border-acad-border/60 bg-white'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="acos-card px-4 py-4">
          <p className="text-xs text-acad-muted mb-2">Upcoming events</p>
          <p className="text-xs text-acad-muted">
            No upcoming events yet. Once your faculty adds exams or deadlines,
            they will appear here.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;

