import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Plus,
  Trash2,
  Calendar,
  Check,
  Clock,
  Loader2,
  Tag as TagIcon
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTasks } from '../../context/TaskContext';
import { api } from '../../api/client';

export const TaskModal = ({ isOpen, onClose, taskToEdit, defaultStatus = 'todo' }) => {
  const { createTask, updateTask, projects } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // AI states
  const [aiScore, setAiScore] = useState(50);
  const [aiRationale, setAiRationale] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
      setPriority(taskToEdit.priority || 'medium');
      setProjectId(taskToEdit.project_id || '');
      setDueDate(taskToEdit.due_date || '');
      setEstimatedHours(taskToEdit.estimated_hours || 0);
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
      setAiScore(taskToEdit.ai_priority_score || 50);
      setAiRationale(taskToEdit.ai_rationale || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setDueDate('');
      setEstimatedHours(2);
      setTags([]);
      setSubtasks([]);
      setAiScore(50);
      setAiRationale('');
    }
  }, [taskToEdit, defaultStatus, isOpen, projects]);

  // AI Feature 1: Generate Description & Subtasks
  const handleAiGenerateDescription = async () => {
    if (!title.trim()) {
      alert('Please enter a task title first before asking AI to generate details!');
      return;
    }

    try {
      setIsGeneratingDesc(true);
      const res = await api.post('/ai/generate-description', {
        title,
        context: description
      });

      const { description: generatedDesc, acceptanceCriteria, suggestedSubtasks, estimatedHours: est } = res.data;

      let fullDescription = generatedDesc;
      if (acceptanceCriteria && acceptanceCriteria.length > 0) {
        fullDescription += `\n\nAcceptance Criteria:\n` + acceptanceCriteria.map(c => `- ${c}`).join('\n');
      }

      setDescription(fullDescription);
      if (est) setEstimatedHours(est);

      // Append suggested subtasks
      if (suggestedSubtasks && suggestedSubtasks.length > 0) {
        const newSubList = suggestedSubtasks.map((st, idx) => ({
          id: `sub_${Date.now()}_${idx}`,
          title: st,
          completed: false
        }));
        setSubtasks(prev => [...prev, ...newSubList]);
      }
    } catch (err) {
      alert(`AI Description failed: ${err.message}`);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // AI Feature 2: Smart Prioritization
  const handleAiSmartPrioritize = async () => {
    if (!title.trim()) {
      alert('Please enter a task title first!');
      return;
    }

    try {
      setIsPrioritizing(true);
      const res = await api.post('/ai/smart-prioritize', {
        title,
        description,
        dueDate,
        tags
      });

      const { priority: newPriority, score, rationale } = res.data;
      setPriority(newPriority);
      setAiScore(score);
      setAiRationale(rationale);
    } catch (err) {
      alert(`AI Prioritization failed: ${err.message}`);
    } finally {
      setIsPrioritizing(false);
    }
  };

  // Tag Handling
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Subtask Handling
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub_${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false
      }
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(
      subtasks.map(s => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description,
        status,
        priority,
        project_id: projectId || null,
        due_date: dueDate || null,
        estimated_hours: Number(estimatedHours) || 0,
        tags,
        subtasks,
        ai_priority_score: aiScore,
        ai_rationale: aiRationale
      };

      if (taskToEdit) {
        await updateTask(taskToEdit.id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      subtitle="Organize, document, and prioritize your workflow with AI"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Task Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Integrate Supabase Realtime Subscriptions"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* AI Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
          <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Co-Pilot:
          </span>

          <button
            type="button"
            onClick={handleAiGenerateDescription}
            disabled={isGeneratingDesc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 transition-all disabled:opacity-50"
          >
            {isGeneratingDesc ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate Spec & Subtasks</span>
          </button>

          <button
            type="button"
            onClick={handleAiSmartPrioritize}
            disabled={isPrioritizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-400/30 transition-all disabled:opacity-50"
          >
            {isPrioritizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Brain className="w-3.5 h-3.5" />
            )}
            <span>Smart Prioritize</span>
          </button>

          {aiRationale && (
            <div className="w-full mt-2 pt-2 border-t border-indigo-500/20 flex items-start gap-2 text-[11px] text-indigo-300">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 font-bold shrink-0">
                Score: {aiScore}/100
              </span>
              <span className="leading-snug">{aiRationale}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Description & Acceptance Criteria
          </label>
          <textarea
            rows={4}
            placeholder="Detailed description, requirements, or test criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        {/* Status, Priority, Project, Due Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent (P0)</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">No Project (General)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Estimated Hours & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estimated Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (press Enter to add)
            </label>
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
              <TagIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="e.g. backend, auth"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-transparent text-xs text-slate-200 placeholder-slate-400 focus:outline-none flex-1"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Subtasks Checklist ({subtasks.filter(s => s.completed).length}/{subtasks.length})
          </label>

          <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs"
              >
                <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />
                  <span className={subtask.completed ? 'line-through text-slate-400' : 'text-slate-200'}>
                    {subtask.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="text-slate-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a new subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
