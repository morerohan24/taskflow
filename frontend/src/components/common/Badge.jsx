import React from 'react';
import { Sparkles, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    medium: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    low: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  };

  const labels = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  const key = priority?.toLowerCase() || 'medium';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[key] || styles.medium
      }`}
    >
      {key === 'urgent' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5" />}
      {labels[key] || labels.medium}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-slate-700/60 text-slate-300 border-slate-600',
    in_progress: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    review: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  const labels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'In Review',
    completed: 'Completed'
  };

  const key = status || 'todo';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[key] || styles.todo
      }`}
    >
      {key === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
      {key === 'in_progress' && <Clock className="w-3 h-3 text-sky-400" />}
      {labels[key] || 'To Do'}
    </span>
  );
};

export const AIScoreBadge = ({ score, rationale }) => {
  if (score === undefined || score === null) return null;

  let color = 'from-indigo-500 to-purple-500 text-indigo-200 border-indigo-500/30';
  if (score >= 80) color = 'from-rose-500 to-orange-500 text-rose-200 border-rose-500/30';
  else if (score >= 60) color = 'from-amber-500 to-yellow-500 text-amber-200 border-amber-500/30';

  return (
    <div
      title={rationale || `AI Priority Score: ${score}/100`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gradient-to-r ${color} bg-opacity-20 border shadow-sm cursor-help`}
    >
      <Sparkles className="w-3 h-3 animate-pulse" />
      <span>AI {score}</span>
    </div>
  );
};
