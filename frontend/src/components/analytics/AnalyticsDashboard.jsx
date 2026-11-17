import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Folder,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../../api/client';
import { PriorityBadge } from '../common/Badge';

export const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading analytics engine...
      </div>
    );
  }

  if (!data) return null;

  const { metrics, priorityBreakdown, projectBreakdown, overdueTasks, upcomingTasks } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Completion Rate</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {metrics.completionRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({metrics.completedTasks}/{metrics.totalTasks} tasks)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>

        {/* Productivity Score */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Productivity Velocity</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400">
              {metrics.productivityScore}
            </span>
            <span className="text-xs text-slate-400">/ 100 AI Score</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.productivityScore}%` }}
            />
          </div>
        </div>

        {/* Active In-Flight Pipeline */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Active In-Flight</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {metrics.inProgressTasks + metrics.reviewTasks}
            </span>
            <span className="text-xs text-slate-400">
              ({metrics.inProgressTasks} dev, {metrics.reviewTasks} review)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics.totalTasks ? Math.round(((metrics.inProgressTasks + metrics.reviewTasks) / metrics.totalTasks) * 100) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Overdue Items */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Attention Required</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">
              {metrics.overdueCount}
            </span>
            <span className="text-xs text-slate-400">overdue deadline(s)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            {metrics.overdueCount === 0 ? 'All deadlines healthy' : 'Immediate reschedule recommended'}
          </p>
        </div>
      </div>

      {/* Grid of Charts: Priority & Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center justify-between">
            <span>Priority Distribution</span>
            <span className="text-xs font-normal text-slate-400">Risk & Impact</span>
          </h3>

          <div className="space-y-3.5">
            {[
              { label: 'Urgent', count: priorityBreakdown.urgent, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: priorityBreakdown.high, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium', count: priorityBreakdown.medium, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'Low', count: priorityBreakdown.low, color: 'bg-slate-500', text: 'text-slate-400' }
            ].map(p => {
              const pct = metrics.totalTasks > 0 ? Math.round((p.count / metrics.totalTasks) * 100) : 0;
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`font-semibold ${p.text}`}>{p.label}</span>
                    <span className="text-slate-400">{p.count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${p.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center justify-between">
            <span>Project Completion Velocity</span>
            <span className="text-xs font-normal text-slate-400">Progress</span>
          </h3>

          <div className="space-y-4">
            {projectBreakdown.map(project => (
              <div key={project.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </span>
                  <span className="text-slate-400">
                    {project.completed}/{project.total} done ({project.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${project.percentage}%`,
                      backgroundColor: project.color || '#6366F1'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <h3 className="text-sm font-bold text-rose-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Overdue Tasks</span>
          </h3>

          {overdueTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              🎉 Zero overdue tasks! You are on schedule.
            </p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map(t => (
                <div key={t.id} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{t.title}</p>
                    <p className="text-[11px] text-rose-400 mt-0.5">Due: {t.due_date}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <h3 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Upcoming Deadlines</span>
          </h3>

          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No scheduled deadlines in the pipeline.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map(t => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{t.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Due: {t.due_date}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
