import type { Task, TaskStatus } from '@/types';

export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(iso: string): number {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function computeStatus(task: Task): TaskStatus {
  if (task.status === 'Completed') return 'Completed';
  if (task.status === 'In Progress') {
    if (daysUntil(task.deadline) < 0) return 'Overdue';
    return 'In Progress';
  }
  if (daysUntil(task.deadline) < 0) return 'Overdue';
  return task.status === 'Overdue' ? 'Overdue' : 'Not Started';
}

export function accountabilityPct(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
