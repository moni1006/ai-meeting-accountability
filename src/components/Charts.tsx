import React from 'react';
import type { Task, TaskStatus } from '@/types';

// Donut chart for task status distribution
export function StatusDonutChart({ tasks }: { tasks: Task[] }) {
  const counts: Record<TaskStatus, number> = {
    'Not Started': 0, 'In Progress': 0, 'Completed': 0, 'Overdue': 0,
  };
  tasks.forEach(t => { counts[t.status]++; });
  const total = tasks.length || 1;

  const colors: Record<TaskStatus, string> = {
    'Not Started': '#9ca3af',
    'In Progress': '#3b82f6',
    'Completed': '#22c55e',
    'Overdue': '#ef4444',
  };

  let offset = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const segments = (Object.keys(counts) as TaskStatus[]).map(status => {
    const pct = counts[status] / total;
    const dash = pct * circumference;
    const segment = { status, dash, offset, color: colors[status], count: counts[status] };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90 flex-shrink-0">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="80" cy="80" r={radius} fill="none"
            stroke={s.color} strokeWidth="16"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            className="transition-all duration-700"
          />
        ))}
      </svg>
      <div className="space-y-2">
        {segments.map(s => (
          <div key={s.status} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600">{s.status}</span>
            <span className="font-semibold text-gray-800">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal bar chart for team accountability
export function TeamBarChart({ tasks }: { tasks: Task[] }) {
  const byPerson: Record<string, { total: number; completed: number }> = {};
  tasks.forEach(t => {
    if (!byPerson[t.assignedTo]) byPerson[t.assignedTo] = { total: 0, completed: 0 };
    byPerson[t.assignedTo].total++;
    if (t.status === 'Completed') byPerson[t.assignedTo].completed++;
  });

  const people = Object.entries(byPerson).sort((a, b) => {
    const aPct = a[1].total ? a[1].completed / a[1].total : 0;
    const bPct = b[1].total ? b[1].completed / b[1].total : 0;
    return bPct - aPct;
  });

  if (people.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No tasks assigned yet</p>;
  }

  return (
    <div className="space-y-4">
      {people.map(([name, { total, completed }]) => {
        const pct = total ? Math.round((completed / total) * 100) : 0;
        return (
          <div key={name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-700">{name}</span>
              <span className="text-xs text-gray-500">{completed}/{total} · {pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
