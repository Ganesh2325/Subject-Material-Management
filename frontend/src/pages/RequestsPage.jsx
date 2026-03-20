import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';
import useAuth from '../hooks/useAuth.js';

const fetchStudentRequests = async (status) => {
  const params = status && status !== 'all' ? { status } : {};
  const res = await client.get('/material-requests/student', { params });
  return res.data;
};

const fetchTeacherRequests = async (status) => {
  const params = status && status !== 'all' ? { status } : {};
  const res = await client.get('/material-requests/teacher', { params });
  return res.data;
};

const fetchSubjects = async () => {
  const res = await client.get('/subjects');
  // For students, assuming /subjects returns accessible subjects containing their nested units.
  return res.data;
};

const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  };
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

const StudentRequests = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    subjectId: '',
    unitId: '',
    requestedTitle: '',
    description: ''
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'student', filter],
    queryFn: () => fetchStudentRequests(filter)
  });

  const createMutation = useMutation({
    mutationFn: (newReq) => client.post('/material-requests', newReq),
    onSuccess: () => {
      queryClient.invalidateQueries(['requests', 'student']);
      setForm({ subjectId: '', unitId: '', requestedTitle: '', description: '' });
      setShowForm(false);
    }
  });

  // Calculate available units based on selected subject
  const selectedSubject = subjects.find(s => s._id === form.subjectId);
  const availableUnits = selectedSubject ? selectedSubject.units : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-md text-xs">
          {['all', 'pending', 'resolved', 'rejected'].map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 font-medium rounded capitalize transition-all ${filter === s ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="acos-button-primary text-xs w-full sm:w-auto"
          >
            + Request Material
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            onSubmit={handleSubmit}
            className="acos-card p-5 border border-primary-200 dark:border-primary-900 bg-primary-50/30 dark:bg-slate-900 shadow-inner"
          >
            <h2 className="text-sm font-semibold text-primary-800 dark:text-primary-400 mb-4 uppercase tracking-wider">
              Submit New Material Request
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject</label>
                <select 
                  required
                  className="acos-input" 
                  value={form.subjectId}
                  onChange={e => setForm({...form, subjectId: e.target.value, unitId: ''})}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map(sub => (
                    <option key={sub._id} value={sub._id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit</label>
                <select 
                  required
                  disabled={!form.subjectId}
                  className="acos-input disabled:opacity-50" 
                  value={form.unitId}
                  onChange={e => setForm({...form, unitId: e.target.value})}
                >
                  <option value="">-- Select Unit --</option>
                  {availableUnits.map(u => (
                    <option key={u._id} value={u._id}>{u.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  className="acos-input"
                  value={form.requestedTitle}
                  onChange={e => setForm({...form, requestedTitle: e.target.value})}
                  placeholder="e.g., Chapter 4 Practice Exercises"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description / Reason</label>
                <textarea
                  rows={3}
                  className="acos-input resize-none"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Additional context or specific needs..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="acos-button-primary disabled:opacity-50"
                disabled={createMutation.isPending || !form.subjectId || !form.unitId}
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="space-y-3">
        {isLoading && <p className="text-center text-slate-500 animate-pulse py-8 text-sm">Loading requests...</p>}
        {!isLoading && requests.length === 0 && (
          <div className="acos-card p-12 text-center text-slate-500 italic text-sm">
            No requests found matching this status.
          </div>
        )}
        <AnimatePresence>
          {requests.map(req => (
            <motion.article 
              key={req._id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="acos-card p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{req.requestedTitle}</h3>
                  <div className="flex gap-2 items-center text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400">{req.subject?.code}</span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{req.description}</p>
              
              {req.status !== 'pending' && req.responseMessage && (
                <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-3 text-sm rounded border border-slate-100 dark:border-slate-800 border-l-2 border-l-primary-500">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">Faculty Response</p>
                  <p className="text-slate-700 dark:text-slate-300 italic">"{req.responseMessage}"</p>
                </div>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </section>
    </div>
  );
};

const FacultyRequests = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending'); // default to pending
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'resolved' | 'rejected'
  const [responseMsg, setResponseMsg] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'teacher', filter],
    queryFn: () => fetchTeacherRequests(filter)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => client.patch(`/material-requests/${id}/status`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['requests', 'teacher']);
      setActionId(null);
      setResponseMsg('');
    }
  });

  const handleAction = (id, type) => {
    setActionId(id);
    setActionType(type);
    setResponseMsg('');
  };

  const submitAction = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: actionId,
      payload: { status: actionType, responseMessage: responseMsg }
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-md text-xs w-full sm:w-min mb-4">
        {['all', 'pending', 'resolved', 'rejected'].map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-1 sm:flex-none px-4 py-1.5 font-medium rounded capitalize transition-all ${filter === s ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="acos-card overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[40vh]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500 animate-pulse">Loading active requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl mb-3 grayscale opacity-50 block">🎉</span>
              <p className="text-slate-500 font-medium">No requests in this queue.</p>
            </div>
          ) : (
            requests.map(req => (
              <article key={req._id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">{req.requestedTitle}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 mb-2">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{req.subject?.code}</span>
                      <span>Requested by <span className="font-medium text-slate-700 dark:text-slate-300">{req.student?.name}</span></span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">{req.description || 'No additional description provided.'}</p>
                    
                    {req.status !== 'pending' && req.responseMessage && (
                      <div className="mt-3 text-xs bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-2 rounded text-emerald-700 dark:text-emerald-400">
                        <span className="font-bold">Your message:</span> {req.responseMessage}
                      </div>
                    )}
                  </div>
                  
                  {req.status === 'pending' && actionId !== req._id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(req._id, 'resolved')}
                        className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Resolve
                      </button>
                      <button 
                        onClick={() => handleAction(req._id, 'rejected')}
                        className="text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {actionId === req._id && (
                    <form onSubmit={submitAction} className="bg-slate-100 dark:bg-slate-800 md:min-w-[300px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">
                        {actionType === 'resolved' ? 'Add Resolution Notes' : 'Add Rejection Reason'}
                      </p>
                      <textarea
                        required
                        rows={2}
                        className="acos-input text-xs resize-none mb-2 bg-white dark:bg-slate-900"
                        placeholder="Reply to the student..."
                        value={responseMsg}
                        onChange={(e) => setResponseMsg(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button" 
                          onClick={() => setActionId(null)}
                          className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700 uppercase"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={updateMutation.isPending}
                          className={`px-3 py-1.5 min-w-[80px] text-xs font-bold rounded shadow-sm text-white ${actionType === 'resolved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} disabled:opacity-50`}
                        >
                          {updateMutation.isPending ? '...' : `Confirm ${actionType}`}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const RequestsPage = () => {
  const { role } = useAuth();
  const isTeacher = role === 'faculty' || role === 'admin';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Material Requests
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          {isTeacher
            ? 'Manage pending requests for new study materials from your enrolled subjects.'
            : 'Request specific learning units or resources that are currently unavailable in your subjects.'}
        </p>
      </header>
      
      {isTeacher ? <FacultyRequests /> : <StudentRequests />}
    </motion.div>
  );
};

export default RequestsPage;
