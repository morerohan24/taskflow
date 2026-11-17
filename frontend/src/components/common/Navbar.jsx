import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export const Navbar = ({ onOpenCreateTask, onOpenAISummary, activeTab }) => {
  const { user, logout } = useAuth();
  const { filters, setFilters } = useTasks();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'kanban': return 'Kanban Board';
      case 'tasks': return 'Task Directory';
      case 'analytics': return 'Productivity Analytics';
      default: return 'Workspace';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
      {/* Title & Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <h1 className="text-lg font-bold text-slate-100 hidden sm:block">
          {getPageTitle()}
        </h1>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or tags..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        {/* AI Standup Summary Trigger */}
        <button
          onClick={onOpenAISummary}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">AI Standup Pulse</span>
        </button>

        {/* Create Task Button */}
        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>New Task</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <img
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
              alt={user?.full_name || 'User'}
              className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
            />
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name || 'Team Member'}
              </span>
              <span className="block text-[10px] text-slate-400 leading-tight">
                {user?.role || 'Intern Intern'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-40 text-xs">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-200">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
