import React, { useMemo } from 'react';
import { Calendar, Users, FileText, CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Card, StatusBadge, PriorityBadge, ProgressBar } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export function MeetingDetails({ meetingId }: { meetingId: string }) {
  const { getMeeting, tasks, decisions } = useStore();
  const { navigate } = useRouter();
  const meeting = getMeeting(meetingId);

  const meetingTasks = useMemo(() => tasks.filter(t => t.meetingId === meetingId), [tasks, meetingId]);
  const meetingDecisions = useMemo(() => decisions.filter(d => d.meetingId === meetingId), [decisions, meetingId]);

  if (!meeting) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Meeting not found.</p>
        <button onClick={() => navigate('/history')} className="mt-4 text-sm text-blue-600 hover:underline">Back to History</button>
      </Card>
    );
  }

  const completed = meetingTasks.filter(t => t.status === 'Completed').length;
  const pct = meetingTasks.length ? Math.round((completed / meetingTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/history')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {/* Meeting header */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{meeting.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(meeting.date)}</span>
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {meeting.participants.join(', ') || 'N/A'}</span>
        </div>
        {meeting.summary && (
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" /> Summary
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{meeting.summary}</p>
          </div>
        )}
      </Card>

      {/* Key decisions */}
      {meetingDecisions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Key Decisions
          </h3>
          <ul className="space-y-2">
            {meetingDecisions.map(d => (
              <li key={d.id} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                {d.decisionText}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Completion Progress</h3>
          <span className="text-sm font-bold text-gray-800">{pct}%</span>
        </div>
        <ProgressBar value={pct} />
        <p className="text-xs text-gray-400 mt-2">{completed} of {meetingTasks.length} tasks completed</p>
      </Card>

      {/* Tasks */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Tasks from this meeting ({meetingTasks.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Assigned To</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {meetingTasks.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No tasks for this meeting</td></tr>
              ) : (
                meetingTasks.map(task => (
                  <tr key={task.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-700">{task.description}</td>
                    <td className="px-5 py-3.5 text-gray-600">{task.assignedTo}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatDate(task.deadline)}</td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={task.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => navigate(`/task/${task.id}`)} className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                        Details <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
