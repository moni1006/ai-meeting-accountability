import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, FileText, ListTodo, TrendingUp, ChevronRight, CalendarClock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Link } from '@/lib/router';
import { Card, CircularProgress } from '@/components/ui';
import { StatusDonutChart, TeamBarChart } from '@/components/Charts';
import { formatDate, daysUntil } from '@/lib/utils';
import type { DashboardStats } from '@/types';

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string;
}) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { meetings, tasks, dashboardStats } = useStore();
  const stats: DashboardStats = dashboardStats();

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [tasks]);

  const recentMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [meetings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your meetings and task accountability</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={FileText} label="Meetings" value={stats.totalMeetings} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={ListTodo} label="Total Tasks" value={stats.totalTasks} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedTasks} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingTasks} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdueTasks} color="text-red-600" bg="bg-red-50" />
        <StatCard icon={TrendingUp} label="Accountability" value={stats.accountability} color="text-blue-600" bg="bg-blue-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accountability circle */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Overall Accountability</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={stats.accountability} size={140} label="completed" />
            <p className="text-sm text-gray-500 mt-4 text-center">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </p>
          </div>
        </Card>

        {/* Task status donut */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Task Status Distribution</h3>
          <div className="flex items-center justify-center py-2">
            <StatusDonutChart tasks={tasks} />
          </div>
        </Card>

        {/* Team accountability */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Team Accountability</h3>
          <TeamBarChart tasks={tasks} />
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming deadlines */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-500" />
              Upcoming Deadlines
            </h3>
            <Link to="/accountability" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map(task => {
                const days = daysUntil(task.deadline);
                return (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{task.description}</p>
                      <p className="text-xs text-gray-400">{task.assignedTo} · {formatDate(task.deadline)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${
                      days < 0 ? 'bg-red-50 text-red-600' : days <= 2 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent meetings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Recent Meetings
            </h3>
            <Link to="/history" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recentMeetings.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No meetings yet</p>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map(m => {
                const meetingTasks = tasks.filter(t => t.meetingId === m.id);
                const completed = meetingTasks.filter(t => t.status === 'Completed').length;
                const pct = meetingTasks.length ? Math.round((completed / meetingTasks.length) * 100) : 0;
                return (
                  <Link key={m.id} to={`/meeting/${m.id}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(m.date)} · {meetingTasks.length} tasks · {pct}% done</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-3" />
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
