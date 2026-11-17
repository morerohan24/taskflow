import React from 'react';
import { TaskFilterBar } from '../components/tasks/TaskFilterBar';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export const KanbanPage = ({ onEditTask, onQuickAdd }) => {
  return (
    <div className="flex flex-col h-full">
      <TaskFilterBar />
      <KanbanBoard onEditTask={onEditTask} onQuickAdd={onQuickAdd} />
    </div>
  );
};
