import React, { useState } from 'react';
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  BarChart3,
  FolderPlus,
  Bot,
  Database,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenNewProject }) => {
  const { projects, deleteProject, filters, setFilters } = useTasks();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            TaskFlow AI
          </span>
          <span className="block text-[10px] text-indigo-400 font-medium tracking-wide uppercase">
            Intelligent SaaS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <p className="px-2 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Projects
            </p>
            <button
              onClick={onOpenNewProject}
              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-md transition-colors"
              title="Add New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, projectId: 'all' }));
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filters.projectId === 'all'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                All Projects
              </span>
            </button>

            {projects.map((project) => {
              const isSelected = filters.projectId === project.id;
              return (
                <div
                  key={project.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, projectId: project.id }));
                    }}
                    className="flex items-center gap-2 truncate flex-1 text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#6366F1' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 group-hover:hidden">
                      {project.task_count || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="hidden group-hover:block p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Engine
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Active
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Database className="w-3 h-3 text-indigo-400" />
            Supabase DB
          </span>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            Ready
          </span>
        </div>
      </div>
    </aside>
  );
};
