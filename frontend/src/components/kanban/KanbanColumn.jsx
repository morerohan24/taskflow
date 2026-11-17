import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';

export const KanbanColumn = ({
  id,
  title,
  color,
  tasks,
  projects,
  onDropTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onQuickAdd
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 shrink-0 bg-slate-900/60 rounded-2xl border transition-all ${
        isDragOver
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-800/40'
          : 'border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAdd(id)}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Scroll Area */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[450px]">
        {tasks.map((task) => {
          const project = projects.find((p) => p.id === task.project_id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              project={project}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          );
        })}

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-400 select-none">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
