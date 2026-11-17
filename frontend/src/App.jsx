import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTasks } from './context/TaskContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TaskModal } from './components/tasks/TaskModal';
import { AISummaryModal } from './components/ai/AISummaryModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { Bot, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const App = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { notification } = useTasks();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState('todo');
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Splash Loader while checking JWT session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 animate-bounce">
          <Bot className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-slate-300">Initializing TaskFlow AI...</p>
      </div>
    );
  }

  // Not logged in -> Render Auth Screen
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleOpenCreateTask = () => {
    setTaskToEdit(null);
    setDefaultTaskStatus('todo');
    setTaskModalOpen(true);
  };

  const handleQuickAdd = (status) => {
    setTaskToEdit(null);
    setDefaultTaskStatus(status);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === 'error'
              ? 'bg-rose-950 border-rose-500/40 text-rose-200'
              : 'bg-slate-900 border-indigo-500/40 text-slate-100 shadow-indigo-500/10'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Collapsible/Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProject={() => setProjectModalOpen(true)}
      />

      {/* Main Workspace App Shell */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Navbar
          activeTab={activeTab}
          onOpenCreateTask={handleOpenCreateTask}
          onOpenAISummary={() => setAiSummaryOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onOpenCreateTask={handleOpenCreateTask}
              onOpenAISummary={() => setAiSummaryOpen(true)}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanPage
              onEditTask={handleEditTask}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksPage
              onEditTask={handleEditTask}
              onOpenCreateTask={handleOpenCreateTask}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultTaskStatus}
      />

      <AISummaryModal
        isOpen={aiSummaryOpen}
        onClose={() => setAiSummaryOpen(false)}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
};
