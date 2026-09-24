import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Meeting, Task, Decision, Comment, User, TaskStatus, TaskPriority, DashboardStats } from '@/types';
import { uid, computeStatus, accountabilityPct } from '@/lib/utils';

interface DB {
  users: User[];
  meetings: Meeting[];
  tasks: Task[];
  decisions: Decision[];
  currentUserId: string | null;
}

const DB_KEY = 'ai_meeting_db_v1';

function seedDB(): DB {
  const today = new Date();
  const iso = (offset: number) => new Date(today.getTime() + offset * 86400000).toISOString().slice(0, 10);

  const user: User = { id: 'demo-user', name: 'Demo User', email: 'demo@meeting.ai', password: 'demo123' };

  const m1: Meeting = {
    id: 'm1', title: 'Project Launch Planning', date: iso(0),
    participants: ['Ravi', 'Priya', 'Arun'],
    transcript: 'Today we discussed the project launch. Ravi will complete the backend API by September 28. Priya will prepare the presentation by September 27. Arun will test the application by September 29. The team agreed to launch the prototype on September 30.',
    summary: 'The team discussed the project launch plan and assigned key deliverables to Ravi, Priya, and Arun. The prototype launch is targeted for September 30.',
    createdAt: new Date().toISOString(), analyzed: true,
  };

  const tasks: Task[] = [
    { id: 't1', meetingId: 'm1', description: 'Complete Backend API', assignedTo: 'Ravi', deadline: iso(4), priority: 'High', status: 'In Progress', comments: [], createdAt: new Date().toISOString() },
    { id: 't2', meetingId: 'm1', description: 'Prepare Presentation', assignedTo: 'Priya', deadline: iso(3), priority: 'Medium', status: 'Not Started', comments: [], createdAt: new Date().toISOString() },
    { id: 't3', meetingId: 'm1', description: 'Test Application', assignedTo: 'Arun', deadline: iso(5), priority: 'High', status: 'Not Started', comments: [], createdAt: new Date().toISOString() },
    { id: 't4', meetingId: 'm1', description: 'Launch Prototype', assignedTo: 'Ravi', deadline: iso(6), priority: 'High', status: 'Not Started', comments: [], createdAt: new Date().toISOString() },
  ];

  const decisions: Decision[] = [
    { id: 'd1', meetingId: 'm1', decisionText: 'The team agreed to launch the prototype on September 30.' },
  ];

  return { users: [user], meetings: [m1], tasks, decisions, currentUserId: null };
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const seeded = seedDB();
  localStorage.setItem(DB_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveDB(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

interface StoreContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  demoLogin: () => void;
  logout: () => void;

  meetings: Meeting[];
  tasks: Task[];
  decisions: Decision[];

  addMeeting: (m: Omit<Meeting, 'id' | 'createdAt' | 'analyzed'>) => string;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  getMeeting: (id: string) => Meeting | undefined;

  setAnalysis: (meetingId: string, summary: string, decisions: string[], tasks: Omit<Task, 'id' | 'meetingId' | 'comments' | 'createdAt'>[]) => void;

  addTask: (t: Omit<Task, 'id' | 'comments' | 'createdAt'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  addComment: (taskId: string, author: string, text: string) => void;

  tasksByMeeting: (meetingId: string) => Task[];
  dashboardStats: () => DashboardStats;
  resetData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDB] = useState<DB>(() => loadDB());

  useEffect(() => { saveDB(db); }, [db]);

  const update = useCallback((fn: (d: DB) => DB) => {
    setDB(prev => fn({ ...prev, meetings: [...prev.meetings], tasks: [...prev.tasks], decisions: [...prev.decisions], users: [...prev.users] }));
  }, []);

  const currentUser = db.users.find(u => u.id === db.currentUserId) ?? null;

  const login = useCallback((email: string, password: string) => {
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) { update(d => ({ ...d, currentUserId: user.id })); return true; }
    return false;
  }, [db.users, update]);

  const demoLogin = useCallback(() => {
    update(d => ({ ...d, currentUserId: d.users[0].id }));
  }, [update]);

  const logout = useCallback(() => {
    update(d => ({ ...d, currentUserId: null }));
  }, [update]);

  const addMeeting = useCallback((m: Omit<Meeting, 'id' | 'createdAt' | 'analyzed'>) => {
    const id = uid('m_');
    update(d => ({
      ...d,
      meetings: [...d.meetings, { ...m, id, createdAt: new Date().toISOString(), analyzed: false }],
    }));
    return id;
  }, [update]);

  const updateMeeting = useCallback((id: string, patch: Partial<Meeting>) => {
    update(d => ({ ...d, meetings: d.meetings.map(m => m.id === id ? { ...m, ...patch } : m) }));
  }, [update]);

  const getMeeting = useCallback((id: string) => db.meetings.find(m => m.id === id), [db.meetings]);

  const setAnalysis = useCallback((meetingId: string, summary: string, decisionTexts: string[], newTasks: Omit<Task, 'id' | 'meetingId' | 'comments' | 'createdAt'>[]) => {
    update(d => {
      const decisions = decisionTexts.map(text => ({ id: uid('d_'), meetingId, decisionText: text }));
      const tasks = newTasks.map(t => ({ ...t, id: uid('t_'), meetingId, comments: [], createdAt: new Date().toISOString() }));
      return {
        ...d,
        meetings: d.meetings.map(m => m.id === meetingId ? { ...m, summary, analyzed: true } : m),
        decisions: [...d.decisions.filter(dec => dec.meetingId !== meetingId), ...decisions],
        tasks: [...d.tasks.filter(t => t.meetingId !== meetingId), ...tasks],
      };
    });
  }, [update]);

  const addTask = useCallback((t: Omit<Task, 'id' | 'comments' | 'createdAt'>) => {
    update(d => ({ ...d, tasks: [...d.tasks, { ...t, id: uid('t_'), comments: [], createdAt: new Date().toISOString() }] }));
  }, [update]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    update(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }));
  }, [update]);

  const deleteTask = useCallback((id: string) => {
    update(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, [update]);

  const getTask = useCallback((id: string) => db.tasks.find(t => t.id === id), [db.tasks]);

  const addComment = useCallback((taskId: string, author: string, text: string) => {
    const comment: Comment = { id: uid('c_'), taskId, author, text, createdAt: new Date().toISOString() };
    update(d => ({ ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t) }));
  }, [update]);

  const tasksByMeeting = useCallback((meetingId: string) => {
    return db.tasks
      .filter(t => t.meetingId === meetingId)
      .map(t => ({ ...t, status: computeStatus(t) }));
  }, [db.tasks]);

  const dashboardStats = useCallback((): DashboardStats => {
    const tasks = db.tasks.map(t => ({ ...t, status: computeStatus(t) }));
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.status === 'Overdue').length;
    const pending = total - completed - overdue;
    return {
      totalMeetings: db.meetings.length,
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      accountability: accountabilityPct(completed, total),
    };
  }, [db.tasks, db.meetings]);

  const resetData = useCallback(() => {
    const seeded = seedDB();
    setDB(seeded);
  }, []);

  return (
    <StoreContext.Provider value={{
      currentUser, login, demoLogin, logout,
      meetings: db.meetings, tasks: db.tasks.map(t => ({ ...t, status: computeStatus(t) })), decisions: db.decisions,
      addMeeting, updateMeeting, getMeeting, setAnalysis,
      addTask, updateTask, deleteTask, getTask, addComment,
      tasksByMeeting, dashboardStats, resetData,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
