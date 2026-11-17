import React from 'react';
import {
  Sparkles,
  Kanban,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Folder,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { PriorityBadge, AIScoreBadge, StatusBadge } from '../components/common/Badge';

export const DashboardPage = ({ setActiveTab, onOpenCreateTask, onOpenAISummary, onEditTask }) => {
  const { user } = useAuth();
  const { tasks, projects, updateTaskStatus } = useTasks();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & AI Pulse Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/50 via-slate-900 to-violet-950/40 border border-indigo-500/25 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {todayStr}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Workflows Active
              </span>
            </div>

            <h2 className="text-2xl font-black text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Leader'} 👋
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              You have <span className="text-indigo-400 font-semibold">{inProgress} tasks</span> in development and{' '}
              <span className={urgentTasks.length > 0 ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                {urgentTasks.length} urgent item{urgentTasks.length === 1 ? '' : 's'}
              </span>{' '}
              requiring priority execution today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAISummary}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Standup</span>
            </button>
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Mini Status Breakdown Progress */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Tasks</span>
            <span className="text-lg font-bold text-slate-100">{total}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Completed</span>
            <span className="text-lg font-bold text-emerald-400">{completed} ({completionRate}%)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">In Progress</span>
            <span className="text-lg font-bold text-sky-400">{inProgress}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Active Projects</span>
            <span className="text-lg font-bold text-indigo-400">{projects.length}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Urgent Attention & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Attention Needed */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Priority & Blockers Radar</span>
            </h3>
            <button
              onClick={() => setActiveTab('kanban')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/20 rounded-2xl border border-slate-800">
              🎉 No urgent blockers pending! All items are within standard velocity.
            </div>
          ) : (
            <div className="space-y-3">
              {urgentTasks.map(t => {
                const project = projects.find(p => p.id === t.project_id);
                return (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <AIScoreBadge score={t.ai_priority_score} rationale={t.ai_rationale} />
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-rose-300 transition-colors">
                      {t.title}
                    </h4>
                    {t.ai_rationale && (
                      <p className="text-[11px] text-rose-300/80 mt-1 line-clamp-2">
                        {t.ai_rationale}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Launchpad & Projects Progress */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>Project Deliverables</span>
            </h3>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {projects.map(p => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {p.progress_percentage || 0}% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${p.progress_percentage || 0}%`,
                      backgroundColor: p.color || '#6366F1'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
