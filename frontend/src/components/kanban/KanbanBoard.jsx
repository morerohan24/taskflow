import React from 'react';
import { KanbanColumn } from './KanbanColumn';
import { useTasks } from '../../context/TaskContext';

export const KanbanBoard = ({ onEditTask, onQuickAdd }) => {
  const { tasks, projects, updateTaskStatus, deleteTask } = useTasks();

  const columns = [
    { id: 'todo', title: 'To Do', color: '#94A3B8' },
    { id: 'in_progress', title: 'In Progress', color: '#38BDF8' },
    { id: 'review', title: 'In Review', color: '#A855F7' },
    { id: 'completed', title: 'Completed', color: '#34D399' }
  ];

  const handleDropTask = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="flex-1 overflow-x-auto pb-6">
      <div className="flex items-start gap-5 min-w-max">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              tasks={colTasks}
              projects={projects}
              onDropTask={handleDropTask}
              onEditTask={onEditTask}
              onDeleteTask={deleteTask}
              onStatusChange={updateTaskStatus}
              onQuickAdd={onQuickAdd}
            />
          );
        })}
      </div>
    </div>
  );
};
