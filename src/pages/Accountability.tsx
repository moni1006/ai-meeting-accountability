import React, { useState, useMemo } from 'react';
import { ListTodo, Filter, ChevronRight, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Card, StatusBadge, PriorityBadge, Select, Input } from '@/components/ui';
import { formatDate, daysUntil } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/types';

export function Accountability() {
  const { tasks, meetings } = useStore();
  const { navigate } = useRouter();

  const [filterPerson, setFilterPerson] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDeadline, setFilterDeadline] = useState('all');
  const [search, setSearch] = useState('');

  const people = useMemo(() => {
    return [...new Set(tasks.map(t => t.assignedTo))].sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterPerson && t.assignedTo !== filterPerson) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterDeadline === 'overdue' && !(daysUntil(t.deadline) < 0)) return false;
      if (filterDeadline === 'upcoming' && !(daysUntil(t.deadline) >= 0 && daysUntil(t.deadline) <= 7)) return false;
      if (filterDeadline === 'today' && daysUntil(t.deadline) !== 0) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.assignedTo.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterPerson, filterStatus, filterPriority, filterDeadline, search]);

  const getMeetingTitle = (id: string) => meetings.find(m => m.id === id)?.title ?? '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Accountability Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage all tasks across meetings</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search tasks..." className="" />
          <Select
            value={filterPerson}
            onChange={setFilterPerson}
            options={[{ value: '', label: 'All People' }, ...people.map(p => ({ value: p, label: p }))]}
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Not Started', label: 'Not Started' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Overdue', label: 'Overdue' },
            ]}
          />
          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
          />
          <Select
            value={filterDeadline}
            onChange={setFilterDeadline}
            options={[
              { value: 'all', label: 'All Deadlines' },
              { value: 'today', label: 'Due Today' },
              { value: 'upcoming', label: 'Due This Week' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Showing {filtered.length} of {tasks.length} tasks
        </div>
      </Card>

      {/* Task table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Assigned To</th>
                <th className="px-5 py-3 font-medium">Meeting</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <ListTodo className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    No tasks match your filters
                  </td>
                </tr>
              ) : (
                filtered.map(task => {
                  const days = daysUntil(task.deadline);
                  return (
                    <tr key={task.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-700">{task.description}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {task.assignedTo.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-600">{task.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[160px] truncate">{getMeetingTitle(task.meetingId)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-gray-600">{formatDate(task.deadline)}</span>
                          {task.status !== 'Completed' && (
                            <span className={`text-[10px] ${days < 0 ? 'text-red-500' : days <= 2 ? 'text-amber-500' : 'text-gray-400'}`}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'due today' : `${days}d left`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={task.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/task/${task.id}`)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Details <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
