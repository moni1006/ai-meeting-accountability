import React, { useState, useMemo } from 'react';
import { Sparkles, FileText, CheckCircle2, XCircle, Edit3, Plus, Trash2, Save, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Card, Button, Input, Textarea, Select, PriorityBadge } from '@/components/ui';
import type { AIAnalysisResult, TaskPriority } from '@/types';
import { formatDate } from '@/lib/utils';

interface EditableTask {
  description: string;
  assignedTo: string;
  deadline: string;
  priority: TaskPriority;
}

export function Analysis({ meetingId }: { meetingId: string }) {
  const { getMeeting, setAnalysis, navigate: _ } = useStore();
  const { navigate } = useRouter();
  const meeting = getMeeting(meetingId);

  const [result, setResult] = useState<AIAnalysisResult | null>(() => {
    const stored = sessionStorage.getItem('pending_analysis_' + meetingId);
    return stored ? JSON.parse(stored) : null;
  });

  const [editSummary, setEditSummary] = useState(false);
  const [summary, setSummary] = useState(result?.summary ?? '');
  const [decisions, setDecisions] = useState<string[]>(result?.decisions ?? []);
  const [tasks, setTasks] = useState<EditableTask[]>(result?.tasks ?? []);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingDecisions, setEditingDecisions] = useState(false);

  if (!meeting) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Meeting not found.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No analysis data found. Please analyze the meeting first.</p>
        <Button className="mt-4" onClick={() => navigate('/create')}>Create Meeting</Button>
      </Card>
    );
  }

  const updateTask = (i: number, patch: Partial<EditableTask>) => {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  };

  const removeTask = (i: number) => {
    setTasks(prev => prev.filter((_, idx) => idx !== i));
  };

  const addTask = () => {
    setTasks(prev => [...prev, { description: '', assignedTo: '', deadline: new Date().toISOString().slice(0, 10), priority: 'Medium' }]);
    setEditingTask(tasks.length);
  };

  const handleConfirm = () => {
    setAnalysis(meetingId, summary, decisions, tasks.filter(t => t.description.trim()));
    sessionStorage.removeItem('pending_analysis_' + meetingId);
    navigate(`/meeting/${meetingId}`);
  };

  const handleReject = () => {
    sessionStorage.removeItem('pending_analysis_' + meetingId);
    navigate('/create');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">AI Analysis</h1>
          </div>
          <p className="text-sm text-gray-500">{meeting.title} · {formatDate(meeting.date)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleReject}>
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button variant="success" onClick={handleConfirm}>
            <CheckCircle2 className="w-4 h-4" />
            Confirm & Save
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Meeting Summary
          </h3>
          {!editSummary ? (
            <button onClick={() => setEditSummary(true)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          ) : (
            <button onClick={() => setEditSummary(false)} className="text-xs text-green-600 hover:underline flex items-center gap-1">
              <Save className="w-3 h-3" /> Done
            </button>
          )}
        </div>
        {editSummary ? (
          <Textarea value={summary} onChange={setSummary} rows={3} />
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
        )}
      </Card>

      {/* Key Decisions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            Key Decisions
          </h3>
          <button
            onClick={() => setEditingDecisions(!editingDecisions)}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            {editingDecisions ? <><Save className="w-3 h-3" /> Done</> : <><Edit3 className="w-3 h-3" /> Edit</>}
          </button>
        </div>
        {editingDecisions ? (
          <div className="space-y-2">
            {decisions.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input value={d} onChange={v => setDecisions(prev => prev.map((x, idx) => idx === i ? v : x))} className="flex-1" />
                <button onClick={() => setDecisions(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setDecisions(prev => [...prev, ''])} className="text-xs">
              <Plus className="w-3 h-3" /> Add Decision
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {decisions.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                {d}
              </li>
            ))}
            {decisions.length === 0 && <p className="text-sm text-gray-400">No decisions detected</p>}
          </ul>
        )}
      </Card>

      {/* Action Items Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Action Items ({tasks.length})</h3>
          <button onClick={addTask} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Task
          </button>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium pr-4">Task</th>
                <th className="pb-3 font-medium pr-4">Assigned To</th>
                <th className="pb-3 font-medium pr-4">Deadline</th>
                <th className="pb-3 font-medium pr-4">Priority</th>
                <th className="pb-3 font-medium w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4">
                    {editingTask === i ? (
                      <Input value={task.description} onChange={v => updateTask(i, { description: v })} className="min-w-[200px]" />
                    ) : (
                      <span className="font-medium text-gray-700">{task.description || '(empty)'}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {editingTask === i ? (
                      <Input value={task.assignedTo} onChange={v => updateTask(i, { assignedTo: v })} className="min-w-[120px]" />
                    ) : (
                      <span className="text-gray-600">{task.assignedTo}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {editingTask === i ? (
                      <Input type="date" value={task.deadline} onChange={v => updateTask(i, { deadline: v })} />
                    ) : (
                      <span className="text-gray-600">{formatDate(task.deadline)}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {editingTask === i ? (
                      <Select
                        value={task.priority}
                        onChange={v => updateTask(i, { priority: v as TaskPriority })}
                        options={[
                          { value: 'High', label: 'High' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Low', label: 'Low' },
                        ]}
                      />
                    ) : (
                      <PriorityBadge priority={task.priority} />
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {editingTask === i ? (
                        <button onClick={() => setEditingTask(null)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                          <Save className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => setEditingTask(i)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => removeTask(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No action items detected</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action bar */}
      <div className="flex justify-end gap-3">
        <Button variant="danger" onClick={handleReject}>
          <XCircle className="w-4 h-4" />
          Reject Analysis
        </Button>
        <Button variant="success" onClick={handleConfirm}>
          <CheckCircle2 className="w-4 h-4" />
          Confirm & Save Tasks
        </Button>
      </div>
    </div>
  );
}
