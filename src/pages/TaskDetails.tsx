import React, { useState } from 'react';
import { ArrowLeft, Save, Trash2, MessageSquare, Send, Calendar, User as UserIcon, Flag, CircleDot } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Card, Button, Input, Select, StatusBadge, PriorityBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/types';

export function TaskDetails({ taskId }: { taskId: string }) {
  const { getTask, updateTask, deleteTask, addComment, currentUser, meetings } = useStore();
  const { navigate } = useRouter();
  const task = getTask(taskId);

  const [description, setDescription] = useState(task?.description ?? '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? '');
  const [deadline, setDeadline] = useState(task?.deadline ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'Medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'Not Started');
  const [comment, setComment] = useState('');

  if (!task) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Task not found.</p>
        <Button className="mt-4" onClick={() => navigate('/accountability')}>Back to Accountability</Button>
      </Card>
    );
  }

  const meeting = meetings.find(m => m.id === task.meetingId);

  const handleSave = () => {
    updateTask(task.id, { description, assignedTo, deadline, priority, status });
    navigate('/accountability');
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask(task.id);
      navigate('/accountability');
    }
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment(task.id, currentUser?.name ?? 'User', comment.trim());
    setComment('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/accountability')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </button>
        <Button variant="danger" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" /> Delete Task
        </Button>
      </div>

      {/* Task header */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-800 mb-1">Task Details</h1>
            {meeting && (
              <p className="text-sm text-gray-500">
                From meeting: <button onClick={() => navigate(`/meeting/${meeting.id}`)} className="text-blue-600 hover:underline">{meeting.title}</button>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700">Edit Task</h3>

        <Input label="Task Description" value={description} onChange={setDescription} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Assigned To" value={assignedTo} onChange={setAssignedTo} />
          <Input label="Deadline" type="date" value={deadline} onChange={setDeadline} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Priority"
            value={priority}
            onChange={v => setPriority(v as TaskPriority)}
            options={[
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={v => setStatus(v as TaskStatus)}
            options={[
              { value: 'Not Started', label: 'Not Started' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="success" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </Card>

      {/* Task meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1"><Calendar className="w-3.5 h-3.5" /><span className="text-xs">Deadline</span></div>
          <p className="text-sm font-medium text-gray-700">{formatDate(deadline)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1"><UserIcon className="w-3.5 h-3.5" /><span className="text-xs">Assignee</span></div>
          <p className="text-sm font-medium text-gray-700">{assignedTo}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1"><Flag className="w-3.5 h-3.5" /><span className="text-xs">Priority</span></div>
          <p className="text-sm font-medium text-gray-700">{priority}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1"><CircleDot className="w-3.5 h-3.5" /><span className="text-xs">Status</span></div>
          <p className="text-sm font-medium text-gray-700">{status}</p>
        </Card>
      </div>

      {/* Comments */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          Comments ({task.comments.length})
        </h3>

        <div className="space-y-3 mb-4">
          {task.comments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No comments yet</p>
          ) : (
            task.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-gray-700">{c.author}</span>
                    <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input value={comment} onChange={setComment} placeholder="Add a comment..." className="flex-1" />
          <Button onClick={handleAddComment} disabled={!comment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
