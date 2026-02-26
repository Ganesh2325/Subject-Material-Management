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
          <h1 className="font-display text-xl text-slate-50">Calendar</h1>
          <p className="text-xs text-slate-400">
            View upcoming exams, assignments and academic events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={goPrevMonth}
            className="px-2 py-1 rounded-lg border border-acosBorder/60 text-slate-200 hover:bg-slate-900"
          >
          &lt;
          </button>
          <p className="text-slate-200 font-medium">{monthLabel}</p>
          <button
            type="button"
            onClick={goNextMonth}
            className="px-2 py-1 rounded-lg border border-acosBorder/60 text-slate-200 hover:bg-slate-900"
          >
            &gt;
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr,1.3fr]">
        <div className="acos-card px-4 py-4">
          <p className="text-xs text-slate-400 mb-2">Monthly view</p>
          <div className="grid grid-cols-7 gap-1 text-[11px] text-center">
            {dayNames.map((d) => (
              <div key={d} className="text-slate-400 py-1">
                {d}
              </div>
            ))}
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={idx} className="h-10 rounded-lg border border-acosBorder/20 bg-slate-950/10" />
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
                  className={`h-10 rounded-lg border text-slate-200 flex items-center justify-center ${
                    isToday
                      ? 'border-acosAccent bg-acosAccent/20 font-semibold'
                      : 'border-acosBorder/40 bg-slate-950/40'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="acos-card px-4 py-4">
          <p className="text-xs text-slate-400 mb-2">Upcoming events</p>
          <p className="text-xs text-slate-500">
            No upcoming events yet. Once your faculty adds exams or deadlines,
            they will appear here.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;

