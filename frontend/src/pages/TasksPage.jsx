import React from 'react';
import { TaskFilterBar } from '../components/tasks/TaskFilterBar';
import { TaskListView } from '../components/tasks/TaskListView';

export const TasksPage = ({ onEditTask, onOpenCreateTask }) => {
  return (
    <div className="space-y-4 pb-12">
      <TaskFilterBar />
      <TaskListView onEditTask={onEditTask} onOpenCreateTask={onOpenCreateTask} />
    </div>
  );
};
