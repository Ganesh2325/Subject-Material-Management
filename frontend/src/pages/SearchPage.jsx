import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';
import useDebouncedValue from '../hooks/useDebouncedValue.js';

const searchApi = async (q) => {
  const res = await client.get('/search', {
    params: { q }
  });
  return res.data;
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 350);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchApi(debounced),
    enabled: debounced.trim().length > 0
  });

  const subjects = data?.subjects || [];
  const materials = data?.materials || [];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-lg text-slate-50">Search</h1>
        <p className="text-xs text-slate-400">
          Search across subjects, units and materials.
        </p>
      </header>

      <section className="acos-card px-4 py-4 space-y-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Keyword
          </label>
          <input
            className="acos-input"
            placeholder="e.g. Data structures, CS201, Unit 3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {debounced && (
          <p className="text-[11px] text-slate-500">
            Showing results for <span className="font-medium">{debounced}</span>
            {isFetching && ' · searching…'}
          </p>
        )}
      </section>

      {debounced && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-xs text-slate-300 font-medium">
              Subjects ({subjects.length})
            </h2>
            {subjects.length === 0 && !isFetching && (
              <p className="text-[11px] text-slate-500">No matching subjects.</p>
            )}
            {subjects.map((s) => (
              <div
                key={s.id}
                className="border border-acosBorder/70 rounded-xl px-3 py-2 text-[11px] bg-slate-950/70"
              >
                <p className="text-slate-300">
                  {s.code} · {s.name}
                </p>
                <p className="text-slate-500">
                  Semester {s.semester} • Score {s.score?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-xs text-slate-300 font-medium">
              Materials ({materials.length})
            </h2>
            {materials.length === 0 && !isFetching && (
              <p className="text-[11px] text-slate-500">No matching materials.</p>
            )}
            {materials.map((m) => (
              <div
                key={m.id}
                className="border border-acosBorder/70 rounded-xl px-3 py-2 text-[11px] bg-slate-950/70 text-[11px]"
              >
                <p className="text-slate-200 mb-0.5">{m.title}</p>
                <p className="text-slate-400">
                  {m.subjectCode} · {m.subjectName} · {m.unitTitle}
                </p>
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-slate-500 truncate max-w-xs">{m.fileUrl}</p>
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-acosAccent hover:text-acosAccentSoft underline"
                  >
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;

