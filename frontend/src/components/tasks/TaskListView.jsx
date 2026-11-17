import React from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Plus
} from 'lucide-react';
import { PriorityBadge, StatusBadge, AIScoreBadge } from '../common/Badge';
import { useTasks } from '../../context/TaskContext';

export const TaskListView = ({ onEditTask, onOpenCreateTask }) => {
  const { tasks, projects, updateTaskStatus, deleteTask } = useTasks();

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">No tasks found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          Get started by creating your first task or clear your search and filter criteria.
        </p>
        <button
          onClick={onOpenCreateTask}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Task</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">AI Score</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {tasks.map((task) => {
              const project = projects.find(p => p.id === task.project_id);
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
              const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onEditTask(task)}
                >
                  {/* Title & tags */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-slate-200 line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {totalSubtasks > 0 && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-indigo-400" />
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                      )}
                      {task.tags && task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  {/* AI Score */}
                  <td className="py-3.5 px-4">
                    <AIScoreBadge score={task.ai_priority_score} rationale={task.ai_rationale} />
                  </td>

                  {/* Project */}
                  <td className="py-3.5 px-4">
                    {project ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: project.color || '#6366F1' }}
                        />
                        {project.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">General</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4">
                    {task.due_date ? (
                      <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${task.title}"?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
