import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client.js';
import useDebouncedValue from '../hooks/useDebouncedValue.js';

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const base = client.defaults.baseURL || '';
  const origin = base.replace(/\/api\/?$/i, '');
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${origin}${path}`;
};

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
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Search across subjects, units and materials.</p>
      </header>

      <section className="acos-card px-4 py-4 space-y-3">
        <div>
          <label className="acos-label">Keyword</label>
          <input
            className="acos-input"
            placeholder="e.g. Data structures, CS201, Unit 3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {debounced && (
          <p className="acos-meta">
            Showing results for <span className="font-medium">{debounced}</span>
            {isFetching && ' · searching…'}
          </p>
        )}
      </section>

      {debounced && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="section-title text-sm">Subjects ({subjects.length})</h2>
            {subjects.length === 0 && !isFetching && (
              <p className="acos-meta">No matching subjects.</p>
            )}
            {subjects.map((s) => (
              <div
                key={s.id}
                className="border border-acad-border rounded-xl px-3 py-2 text-xs bg-white dark:border-acosBorder dark:bg-slate-950/70"
              >
                <p className="text-acad-text dark:text-slate-100">
                  {s.code} · {s.name}
                </p>
                <p className="acos-meta">
                  Semester {s.semester} • Score {s.score?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="section-title text-sm">Materials ({materials.length})</h2>
            {materials.length === 0 && !isFetching && (
              <p className="acos-meta">No matching materials.</p>
            )}
            {materials.map((m) => (
              <div
                key={m.id}
                className="border border-acad-border rounded-xl px-3 py-2 text-xs bg-white dark:border-acosBorder dark:bg-slate-950/70"
              >
                <p className="text-acad-text dark:text-slate-100 mb-0.5">
                  {m.title}
                </p>
                <p className="acos-meta">
                  {m.subjectCode} · {m.subjectName} · {m.unitTitle}
                </p>
                <div className="flex justify-between items-center mt-1.5">
                  <p className="acos-meta truncate max-w-xs">{m.fileUrl}</p>
                  <a
                    href={resolveFileUrl(m.fileUrl)}
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

