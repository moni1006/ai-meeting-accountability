import React, { useMemo } from 'react';
import { History, Users, ListTodo, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Card, ProgressBar } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export function MeetingHistory() {
  const { meetings, tasks } = useStore();
  const { navigate } = useRouter();

  const sorted = useMemo(() => {
    return [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Meeting History</h1>
        <p className="text-sm text-gray-500 mt-1">All analyzed meetings and their completion progress</p>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="w-12 h-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 mb-4">No meetings yet</p>
          <button
            onClick={() => navigate('/create')}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Create your first meeting
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(m => {
            const meetingTasks = tasks.filter(t => t.meetingId === m.id);
            const completed = meetingTasks.filter(t => t.status === 'Completed').length;
            const pct = meetingTasks.length ? Math.round((completed / meetingTasks.length) * 100) : 0;

            return (
              <Card
                key={m.id}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div onClick={() => navigate(`/meeting/${m.id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 truncate">{m.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(m.date)}
                      </div>
                    </div>
                    {m.analyzed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                        <Sparkles className="w-3 h-3" />
                        AI Analyzed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{m.participants.join(', ') || 'No participants'}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ListTodo className="w-3.5 h-3.5 text-gray-400" />
                      {meetingTasks.length} tasks
                    </div>
                    <div className="flex-1" />
                    <span className="text-xs font-medium text-gray-700">{pct}% complete</span>
                  </div>

                  <ProgressBar value={pct} />

                  <div className="flex justify-end mt-3">
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
