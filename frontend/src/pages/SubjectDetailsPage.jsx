import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchSubjects = async () => {
  const res = await client.get('/subjects');
  return res.data;
};

const addUnitApi = async ({ subjectId, title }) => {
  const res = await client.post(`/subjects/${subjectId}/unit`, { title });
  return res.data;
};

const addMaterialApi = async ({ subjectId, unitId, title, file }) => {
  const form = new FormData();
  form.append('title', title);
  form.append('file', file);

  const res = await client.post(`/subjects/${subjectId}/unit/${unitId}/material`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

const getMaterialApi = async ({ materialId }) => {
  const res = await client.get(`/material/${materialId}`);
  return res.data;
};

const recordMaterialDownloadApi = async ({ subjectId, unitId, materialId }) => {
  const res = await client.post('/material-views/download', {
    subjectId,
    unitId,
    materialId
  });
  return res.data;
};

const addBookmarkApi = async ({ subjectId, unitId, materialId }) => {
  const res = await client.post('/bookmarks', {
    subjectId,
    unitId,
    materialId
  });
  return res.data;
};

const toggleUnitCompletionApi = async ({ subjectId, unitId }) => {
  const res = await client.post('/progress/unit', {
    subjectId,
    unitId
  });
  return res.data;
};

const SubjectDetailsPage = () => {
  const { subjectId } = useParams();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'faculty';
  const MAX_BYTES = 100 * 1024 * 1024;

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const subject = useMemo(
    () => subjects.find((s) => s._id === subjectId),
    [subjects, subjectId]
  );

  const [unitTitle, setUnitTitle] = useState('');
  const [unitError, setUnitError] = useState('');
  const [materialForm, setMaterialForm] = useState({});
  const [openUnitId, setOpenUnitId] = useState(null);

  const addUnitMutation = useMutation({
    mutationFn: addUnitApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setUnitTitle('');
      setUnitError('');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Add unit failed';
      setUnitError(msg);
    }
  });

  const addMaterialMutation = useMutation({
    mutationFn: addMaterialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setMaterialForm({});
    }
  });

  const getMaterialMutation = useMutation({
    mutationFn: getMaterialApi,
    onSuccess: (data) => {
      const fileSrc = resolveFileUrl(data?.material?.fileUrl);
      if (fileSrc) {
        window.open(fileSrc, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'student'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: () => {}
  });

  const materialDownloadMutation = useMutation({
    mutationFn: recordMaterialDownloadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'student'] });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: addBookmarkApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'student'] });
    }
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: toggleUnitCompletionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'student'] });
    }
  });

  const handleMaterialChange = (unitId, field, value) => {
    setMaterialForm((prev) => ({
      ...prev,
      [unitId]: {
        ...(prev[unitId] || {}),
        [field]: value
      }
    }));
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
  };

  const resolveFileUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    const base = client.defaults.baseURL || '';
    const origin = base.replace(/\/api\/?$/i, '');
    const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${origin}${path}`;
  };

  const onAddUnit = (e) => {
    e.preventDefault();
    if (!subjectId) return;
    setUnitError('');
    addUnitMutation.mutate({ subjectId, title: unitTitle });
  };

  const onAddMaterial = (e, unitId) => {
    e.preventDefault();
    const values = materialForm[unitId];
    if (!values?.title) {
      handleMaterialChange(unitId, 'error', 'Material title is required.');
      return;
    }

    if (!values?.file) {
      handleMaterialChange(unitId, 'error', 'Please select a file to upload.');
      return;
    }

    if (values.file.size > MAX_BYTES) {
      handleMaterialChange(
        unitId,
        'error',
        'File too large. Maximum allowed size is 100MB.'
      );
      return;
    }

    handleMaterialChange(unitId, 'error', '');
    addMaterialMutation.mutate({
      subjectId,
      unitId,
      title: values.title,
      file: values.file
    });
  };

  const handleOpenMaterial = (materialId) => {
    getMaterialMutation.mutate({ materialId });
  };

  const handleBookmark = (unitId, materialId) => {
    if (!subjectId) return;
    bookmarkMutation.mutate({
      subjectId,
      unitId,
      materialId
    });
  };

  const handleToggleCompletion = (unitId) => {
    if (!subjectId) return;
    toggleCompletionMutation.mutate({
      subjectId,
      unitId
    });
  };

  if (isLoading) {
    return <p className="acos-meta">Loading subject…</p>;
  }

  if (!subject) {
    return <p className="acos-meta">Subject not found.</p>;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1">
        <p className="acos-meta mb-1">{subject.code}</p>
        <h1 className="page-title">{subject.name}</h1>
        <p className="page-subtitle">
          Semester {subject.semester} · {subject.units?.length || 0} units
        </p>
      </header>

      {canManage && (
        <section className="acos-card px-4 py-4">
          <p className="section-title mb-2">Add unit (faculty / admin)</p>
          <form
            onSubmit={onAddUnit}
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
          >
            <div className="flex-1 w-full">
              <label className="acos-label">Unit title</label>
              <input
                className="acos-input"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="acos-button-primary text-xs"
              disabled={addUnitMutation.isPending}
            >
              {addUnitMutation.isPending ? 'Saving…' : 'Add unit'}
            </button>
          </form>
          {unitError && (
            <p className="text-xs text-red-400 mt-2" role="alert">
              {unitError}
            </p>
          )}
        </section>
      )}

      <section className="space-y-3">
        {subject.units?.length === 0 && (
          <p className="acos-meta">No units yet.</p>
        )}

        <AnimatePresence initial={false}>
          {subject.units?.map((unit) => {
            const isOpen = openUnitId === unit._id;
            const materials = unit.materials || [];
            const mf = materialForm[unit._id] || { title: '', file: null, error: '' };

            return (
              <motion.article
                key={unit._id}
                className="acos-card px-4 py-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-between text-left"
                    onClick={() => setOpenUnitId(isOpen ? null : unit._id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-acad-text dark:text-slate-100">
                        {unit.title}
                      </p>
                      <p className="acos-meta">{materials.length} materials</p>
                    </div>
                    <span className="acos-meta">{isOpen ? 'Hide' : 'Show'}</span>
                  </button>
                  {!canManage && (
                    <button
                      type="button"
                      onClick={() => handleToggleCompletion(unit._id)}
                      className="text-xs px-2 py-1 rounded-lg border border-acad-border text-acad-text hover:bg-primary-100 hover:text-primary-700 dark:border-acosBorder dark:text-slate-200 dark:hover:bg-slate-900"
                      disabled={toggleCompletionMutation.isPending}
                    >
                      Mark unit complete
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="mt-3 space-y-3 overflow-hidden"
                    >
                      <div className="space-y-2">
                        {materials.length === 0 && (
                          <p className="acos-meta">No materials yet.</p>
                        )}
                        {materials.map((m) => {
                          const fileSrc = resolveFileUrl(m.fileUrl);

                          return (
                            <div
                              key={m._id}
                              className="flex items-center justify-between gap-3 text-xs border border-acad-border rounded-xl px-3 py-2 bg-white dark:border-acosBorder dark:bg-slate-950/70"
                            >
                              <div className="min-w-0">
                                <p className="text-acad-text dark:text-slate-100 truncate">
                                  {m.title}
                                </p>
                                <p className="text-xs text-acad-muted dark:text-slate-400 truncate max-w-xs">
                                  {m.fileName || m.fileUrl}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {!canManage && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleBookmark(unit._id, m._id)
                                      }
                                      className="px-2 py-1 rounded-lg border border-acad-border bg-white text-xs text-acad-text hover:bg-primary-50 hover:text-primary-700 dark:border-acosBorder dark:bg-slate-900 dark:text-slate-200"
                                      disabled={bookmarkMutation.isPending}
                                    >
                                      Bookmark
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMaterial(m._id)}
                                      className="text-acosAccent hover:text-acosAccentSoft underline"
                                    >
                                      Preview
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!subjectId || !fileSrc) return;
                                        materialDownloadMutation.mutate(
                                          {
                                            subjectId,
                                            unitId: unit._id,
                                            materialId: m._id
                                          },
                                          {
                                            onSuccess: () => {
                                              window.open(
                                                fileSrc,
                                                '_blank',
                                                'noopener,noreferrer'
                                              );
                                            }
                                          }
                                        );
                                      }}
                                      className="px-2 py-1 rounded-lg border border-acad-border bg-white text-xs text-acad-text hover:bg-primary-50 hover:text-primary-700 dark:border-acosBorder dark:bg-slate-900 dark:text-slate-200"
                                      disabled={materialDownloadMutation.isPending}
                                    >
                                      Download
                                    </button>
                                  </>
                                )}
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (fileSrc) {
                                        window.open(
                                          fileSrc,
                                          '_blank',
                                          'noopener,noreferrer'
                                        );
                                      }
                                    }}
                                    className="text-acosAccent hover:text-acosAccentSoft underline"
                                  >
                                    Open
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {canManage && (
                        <form
                          onSubmit={(e) => onAddMaterial(e, unit._id)}
                          className="grid gap-2 md:grid-cols-[1.3fr,2fr,auto] items-end pt-2 border-t border-acosBorder/60"
                        >
                          <div>
                            <label className="acos-label">Material title</label>
                            <input
                              className="acos-input"
                              value={mf.title || ''}
                              onChange={(e) =>
                                handleMaterialChange(
                                  unit._id,
                                  'title',
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="acos-label">
                              Upload file (max 100MB)
                            </label>
                            <div
                              className="rounded-2xl border border-dashed border-acosBorder/80 px-3 py-3 transition-colors hover:bg-primary-50/40 dark:hover:bg-slate-800/60"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dropped = e.dataTransfer.files?.[0];
                                if (!dropped) return;
                                if (dropped.size > MAX_BYTES) {
                                  handleMaterialChange(unit._id, 'file', null);
                                  handleMaterialChange(
                                    unit._id,
                                    'error',
                                    'File too large. Maximum allowed size is 100MB.'
                                  );
                                  return;
                                }
                                handleMaterialChange(unit._id, 'file', dropped);
                                handleMaterialChange(unit._id, 'error', '');
                              }}
                            >
                              <input
                                id={`material-file-${unit._id}`}
                                type="file"
                                className="hidden"
                                accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => {
                                  const picked = e.target.files?.[0];
                                  if (!picked) return;
                                  if (picked.size > MAX_BYTES) {
                                    handleMaterialChange(unit._id, 'file', null);
                                    handleMaterialChange(
                                      unit._id,
                                      'error',
                                      'File too large. Maximum allowed size is 100MB.'
                                    );
                                    return;
                                  }
                                  handleMaterialChange(unit._id, 'file', picked);
                                  handleMaterialChange(unit._id, 'error', '');
                                }}
                              />
                              <label
                                htmlFor={`material-file-${unit._id}`}
                                className="block cursor-pointer"
                              >
                                <p className="text-xs font-medium text-acad-text dark:text-slate-100">
                                  Drag & drop a PDF/PPT/DOCX here, or click to choose
                                </p>
                                <p className="acos-meta mt-0.5">
                                  {mf.file
                                    ? `${mf.file.name} • ${formatBytes(mf.file.size)}`
                                    : 'No file selected'}
                                </p>
                              </label>
                            </div>
                            {mf.error && (
                              <p className="text-xs text-red-400 mt-1" role="alert">
                                {mf.error}
                              </p>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="acos-button-primary text-xs"
                            disabled={addMaterialMutation.isPending}
                          >
                            {addMaterialMutation.isPending
                              ? 'Saving…'
                              : 'Add material'}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default SubjectDetailsPage;

