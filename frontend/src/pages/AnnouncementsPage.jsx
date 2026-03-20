import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchAnnouncements = async () => {
  const res = await client.get('/announcements');
  return res.data;
};

const fetchSubjects = async () => {
  const res = await client.get('/subjects');
  return res.data;
};

const AnnouncementsPage = () => {
  const { role } = useAuth();
  const isTeacher = role === 'faculty' || role === 'admin';
  const queryClient = useQueryClient();

  // Sort & Filter state
  const [filterSubject, setFilterSubject] = useState('');
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' | 'priority'
  
  // Form state for Faculty
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    subject: ''
  });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  });

  const createMutation = useMutation({
    mutationFn: (newAnn) => client.post('/announcements', newAnn),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => client.put(`/announcements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
    }
  });

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'normal', subject: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.subject) delete payload.subject; // Send null/undefined if empty

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (ann) => {
    setForm({
      title: ann.title,
      description: ann.description,
      priority: ann.priority,
      subject: ann.subject?._id || ''
    });
    setEditingId(ann._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const processedAnnouncements = useMemo(() => {
    let filtered = [...announcements];

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(a => a.subject?._id === filterSubject || String(a.subject) === filterSubject);
    }

    // Sort Order
    if (sortOrder === 'priority') {
      const pLevel = { high: 3, normal: 2, low: 1 };
      filtered.sort((a, b) => {
        const diff = pLevel[b.priority] - pLevel[a.priority];
        if (diff !== 0) return diff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      // Latest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [announcements, filterSubject, sortOrder]);

  const isRecent = (dateStr) => {
    const hours = Math.abs(new Date() - new Date(dateStr)) / 36e5;
    return hours <= 48; // Less than 48 hours is considered "New/Unread"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">
            Important updates, reminders, and course-wide communications.
          </p>
        </div>
        {isTeacher && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="acos-button-primary md:w-auto w-full whitespace-nowrap"
          >
            + Post Announcement
          </button>
        )}
      </header>

      <AnimatePresence>
        {showForm && isTeacher && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            onSubmit={handleSubmit}
            className="acos-card p-5 border border-primary-200 dark:border-primary-900 bg-primary-50/30 dark:bg-slate-900 shadow-inner"
          >
            <h2 className="text-sm font-semibold text-primary-800 dark:text-primary-400 mb-4 uppercase tracking-wider">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="acos-input"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g., Midterm Exam Schedule"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description / Content</label>
                <textarea
                  required
                  rows={4}
                  className="acos-input resize-none"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Type your announcement here..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject (Optional)</label>
                  <select 
                    className="acos-input" 
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                  >
                    <option value="">-- General / All Subjects --</option>
                    {subjects.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                  <select 
                    className="acos-input"
                    value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="acos-button-primary disabled:opacity-50"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Publish Announcement'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="acos-card overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-widest hidden sm:inline-block">Filter:</span>
            <select 
              className="acos-input py-1.5 text-xs flex-1"
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-md w-full sm:w-auto">
            <button 
              onClick={() => setSortOrder('latest')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded transition-all ${sortOrder === 'latest' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Latest
            </button>
            <button 
              onClick={() => setSortOrder('priority')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded transition-all ${sortOrder === 'priority' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Priority
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500 animate-pulse">Loading announcements...</div>
          ) : processedAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-slate-500 font-medium font-display">No announcements found.</p>
              <p className="text-xs text-slate-400 mt-1">Check back later for updates.</p>
            </div>
          ) : (
            <AnimatePresence>
              {processedAnnouncements.map((ann) => (
                <motion.article 
                  key={ann._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/10 ${ann.priority === 'high' ? 'bg-rose-50/30 dark:bg-rose-900/5' : ''}`}
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-semibold text-lg ${ann.priority === 'high' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {ann.title}
                      </h3>
                      {ann.priority === 'high' && (
                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                          Important
                        </span>
                      )}
                      {!isTeacher && isRecent(ann.createdAt) && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                          New
                        </span>
                      )}
                    </div>
                    {isTeacher && (
                      <div className="flex gap-2 text-xs flex-shrink-0">
                        <button 
                          onClick={() => handleEdit(ann)}
                          className="text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this announcement?')) {
                              deleteMutation.mutate(ann._id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-3">
                    <span className="font-medium">{new Date(ann.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                    <span>•</span>
                    <span className="inline-flex gap-1">Posted by <span className="text-slate-700 dark:text-slate-300 font-medium">{ann.createdBy?.name || 'Faculty'}</span></span>
                    {ann.subject && (
                      <>
                        <span>•</span>
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">{ann.subject.code}</span>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {ann.description}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default AnnouncementsPage;
