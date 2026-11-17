import React from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  ArrowRight
} from 'lucide-react';
import { PriorityBadge, AIScoreBadge } from '../common/Badge';

export const TaskCard = ({ task, project, onEdit, onDelete, onStatusChange }) => {
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getNextStatus = (current) => {
    switch (current) {
      case 'todo': return 'in_progress';
      case 'in_progress': return 'review';
      case 'review': return 'completed';
      default: return null;
    }
  };

  const nextStatus = getNextStatus(task.status);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit(task)}
      className="group bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <AIScoreBadge score={task.ai_priority_score} rationale={task.ai_rationale} />
        </div>

        {/* Quick action buttons on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {nextStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(task.id, nextStatus);
              }}
              title={`Move to ${nextStatus.replace('_', ' ')}`}
              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete task"
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-100 mb-1.5 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* AI Rationale Snippet (if urgent/high) */}
      {task.ai_rationale && task.priority === 'urgent' && (
        <div className="mb-3 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
          <span className="font-semibold">AI Note:</span> {task.ai_rationale}
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/80 text-slate-400 border border-slate-700/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
        {/* Project Tag */}
        {project ? (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium truncate max-w-[120px]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: project.color || '#6366F1' }}
            />
            <span className="truncate">{project.name}</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">General</span>
        )}

        <div className="flex items-center gap-3">
          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400" title="Subtasks">
              <CheckSquare className="w-3 h-3 text-indigo-400" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </span>
          )}

          {/* Due Date */}
          {task.due_date && (
            <span
              className={`flex items-center gap-1 text-[11px] ${
                isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
              }`}
              title={isOverdue ? 'Task is overdue!' : 'Due date'}
            >
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
