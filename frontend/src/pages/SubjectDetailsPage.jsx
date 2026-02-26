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

const addMaterialApi = async ({ subjectId, unitId, title, fileUrl }) => {
  const res = await client.post(`/materials/${subjectId}/unit/${unitId}`, {
    title,
    fileUrl
  });
  return res.data;
};

const recordMaterialViewApi = async ({ subjectId, unitId, materialId }) => {
  const res = await client.post('/material-views', {
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

  const materialViewMutation = useMutation({
    mutationFn: recordMaterialViewApi,
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

  const onAddUnit = (e) => {
    e.preventDefault();
    if (!subjectId) return;
    setUnitError('');
    addUnitMutation.mutate({ subjectId, title: unitTitle });
  };

  const onAddMaterial = (e, unitId) => {
    e.preventDefault();
    const values = materialForm[unitId];
    if (!values?.title || !values?.fileUrl) {
      return;
    }
    addMaterialMutation.mutate({
      subjectId,
      unitId,
      title: values.title,
      fileUrl: values.fileUrl
    });
  };

  const handleOpenMaterial = (unitId, materialId, fileUrl) => {
    if (!subjectId) return;

    materialViewMutation.mutate({
      subjectId,
      unitId,
      materialId
    });

    window.open(fileUrl, '_blank', 'noopener,noreferrer');
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
    return <p className="text-xs text-slate-400">Loading subject…</p>;
  }

  if (!subject) {
    return <p className="text-xs text-slate-400">Subject not found.</p>;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] text-slate-400 mb-1">{subject.code}</p>
        <h1 className="font-display text-lg text-slate-50">{subject.name}</h1>
        <p className="text-xs text-slate-400">
          Semester {subject.semester} · {subject.units?.length || 0} units
        </p>
      </header>

      {canManage && (
        <section className="acos-card px-4 py-4">
          <p className="text-xs text-slate-300 mb-2 font-medium">
            Add unit (faculty / admin)
          </p>
          <form
            onSubmit={onAddUnit}
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
          >
            <div className="flex-1 w-full">
              <label className="block text-[11px] text-slate-400 mb-1">
                Unit title
              </label>
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
            <p className="text-[11px] text-red-400 mt-2" role="alert">
              {unitError}
            </p>
          )}
        </section>
      )}

      <section className="space-y-3">
        {subject.units?.length === 0 && (
          <p className="text-xs text-slate-400">No units yet.</p>
        )}

        <AnimatePresence initial={false}>
          {subject.units?.map((unit) => {
            const isOpen = openUnitId === unit._id;
            const materials = unit.materials || [];
            const mf = materialForm[unit._id] || { title: '', fileUrl: '' };

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
                      <p className="text-xs text-slate-300 font-medium">
                        {unit.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {materials.length} materials
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {isOpen ? 'Hide' : 'Show'}
                    </span>
                  </button>
                  {!canManage && (
                    <button
                      type="button"
                      onClick={() => handleToggleCompletion(unit._id)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-acosBorder/70 text-slate-200 hover:bg-slate-900"
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
                          <p className="text-[11px] text-slate-400">
                            No materials yet.
                          </p>
                        )}
                        {materials.map((m) => (
                          <div
                            key={m._id}
                            className="flex items-center justify-between gap-3 text-[11px] border border-acosBorder/70 rounded-xl px-3 py-2 bg-slate-950/70"
                          >
                            <div className="min-w-0">
                              <p className="text-slate-200 truncate">
                                {m.title}
                              </p>
                              <p className="text-slate-500 truncate max-w-xs">
                                {m.fileUrl}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {!canManage && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleBookmark(unit._id, m._id)
                                  }
                                  className="px-2 py-1 rounded-lg border border-acosBorder/70 text-[10px] text-slate-200 hover:bg-slate-900"
                                  disabled={bookmarkMutation.isPending}
                                >
                                  Bookmark
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMaterial(
                                    unit._id,
                                    m._id,
                                    m.fileUrl
                                  )
                                }
                                className="text-acosAccent hover:text-acosAccentSoft underline"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {canManage && (
                        <form
                          onSubmit={(e) => onAddMaterial(e, unit._id)}
                          className="grid gap-2 md:grid-cols-[1.3fr,2fr,auto] items-end pt-2 border-t border-acosBorder/60"
                        >
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Material title
                            </label>
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
                            <label className="block text-[11px] text-slate-400 mb-1">
                              File URL
                            </label>
                            <input
                              className="acos-input"
                              value={mf.fileUrl || ''}
                              onChange={(e) =>
                                handleMaterialChange(
                                  unit._id,
                                  'fileUrl',
                                  e.target.value
                                )
                              }
                              required
                            />
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

