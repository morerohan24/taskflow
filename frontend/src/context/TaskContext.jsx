import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    projectId: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(prev => (prev && prev.id === notification?.id ? null : prev));
    }, 3500);
  };

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/tasks', filters);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProjects();
    } else {
      setTasks([]);
      setProjects([]);
    }
  }, [isAuthenticated, fetchTasks, fetchProjects]);

  // Create Task
  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      setTasks(prev => [res.data, ...prev]);
      fetchProjects(); // refresh task count on projects
      showNotification('Task created successfully! 🎉');
      return res.data;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // Update Task
  const updateTask = async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => (t.id === id ? res.data : t)));
      showNotification('Task updated successfully.');
      return res.data;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // Move Task Status (Optimistic update for snappy Kanban drag)
  const updateTaskStatus = async (id, newStatus) => {
    const previousTasks = [...tasks];
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
    } catch (err) {
      // Revert on failure
      setTasks(previousTasks);
      showNotification(`Failed to move task: ${err.message}`, 'error');
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      fetchProjects();
      showNotification('Task deleted.');
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // Project CRUD
  const createProject = async (projectData) => {
    try {
      const res = await api.post('/projects', projectData);
      setProjects(prev => [res.data, ...prev]);
      showNotification(`Project "${res.data.name}" created!`);
      return res.data;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      fetchTasks();
      showNotification('Project deleted.');
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        loading,
        filters,
        setFilters,
        fetchTasks,
        fetchProjects,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        createProject,
        deleteProject,
        notification,
        showNotification
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
