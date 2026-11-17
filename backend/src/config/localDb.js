/**
 * Local In-Memory & File-backed Database Adapter for TaskFlow AI
 * 
 * Provides an immediate, 0-config experience for evaluators while maintaining
 * the exact schema and data types expected by Supabase.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '..', '..', 'local_data.json');

// Default initial seed data
const getInitialData = () => {
  const hashedPassword = bcrypt.hashSync('demo123', 10);
  const demoUserId = 'usr_demo_8f9a2b1c';

  return {
    users: [
      {
        id: demoUserId,
        email: 'demo@taskflow.ai',
        password: hashedPassword,
        full_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Senior Product Manager',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ],
    projects: [
      {
        id: 'prj_01_core',
        user_id: demoUserId,
        name: 'AI Automation Suite',
        description: 'Core intelligence engine and background worker microservices.',
        color: '#6366F1',
        icon: 'Bot',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'prj_02_mobile',
        user_id: demoUserId,
        name: 'Mobile App 2.0',
        description: 'Cross-platform React Native client with offline sync.',
        color: '#10B981',
        icon: 'Smartphone',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'prj_03_infra',
        user_id: demoUserId,
        name: 'Cloud & Security',
        description: 'SOC2 compliance, rate limiting, and zero-trust auth.',
        color: '#F59E0B',
        icon: 'ShieldCheck',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ],
    tasks: [
      {
        id: 'tsk_01',
        user_id: demoUserId,
        project_id: 'prj_01_core',
        title: 'Implement Smart AI Prioritization Engine',
        description: 'Design algorithms to compute urgency, business impact, and deadline proximity to automatically assign priority scores (1-100).',
        status: 'in_progress',
        priority: 'urgent',
        ai_priority_score: 94,
        ai_rationale: 'Critical path dependency for Q4 SaaS launch. Directly impacts core value proposition.',
        due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        tags: ['AI/ML', 'Backend', 'Core'],
        subtasks: [
          { id: 'sub_1', title: 'Define scoring weight matrices', completed: true },
          { id: 'sub_2', title: 'Integrate Gemini API reasoning prompts', completed: true },
          { id: 'sub_3', title: 'Write unit tests for edge cases', completed: false }
        ],
        estimated_hours: 8,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tsk_02',
        user_id: demoUserId,
        project_id: 'prj_02_mobile',
        title: 'Design Kanban Drag-and-Drop Interaction',
        description: 'Create responsive column transitions with optimistic updates, smooth hover states, and touch gesture support for tablet/mobile.',
        status: 'review',
        priority: 'high',
        ai_priority_score: 82,
        ai_rationale: 'High customer impact on daily interaction velocity. Design review pending.',
        due_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        tags: ['Frontend', 'UX', 'Kanban'],
        subtasks: [
          { id: 'sub_4', title: 'Implement HTML5 drag events', completed: true },
          { id: 'sub_5', title: 'Add animated drop placeholder', completed: true },
          { id: 'sub_6', title: 'Cross-browser QA testing', completed: false }
        ],
        estimated_hours: 6,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tsk_03',
        user_id: demoUserId,
        project_id: 'prj_03_infra',
        title: 'Configure JWT Auth & Supabase RLS Policies',
        description: 'Establish secure row-level security policies on tasks and projects tables to ensure tenant isolation.',
        status: 'completed',
        priority: 'high',
        ai_priority_score: 88,
        ai_rationale: 'Core security prerequisite before opening beta onboarding.',
        due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        tags: ['Security', 'Database', 'Auth'],
        subtasks: [
          { id: 'sub_7', title: 'Write RLS SQL policies', completed: true },
          { id: 'sub_8', title: 'Create JWT auth middleware', completed: true }
        ],
        estimated_hours: 5,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tsk_04',
        user_id: demoUserId,
        project_id: 'prj_01_core',
        title: 'Automated Daily Standup Summary Generator',
        description: 'Synthesize completed, in-progress, and blocked items into a crisp morning digest for engineering leads.',
        status: 'todo',
        priority: 'medium',
        ai_priority_score: 65,
        ai_rationale: 'Strong productivity multiplier for distributed teams.',
        due_date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        tags: ['AI/ML', 'Productivity'],
        subtasks: [
          { id: 'sub_9', title: 'Draft LLM synthesis prompt template', completed: false },
          { id: 'sub_10', title: 'Build modal UI with copy-to-slack button', completed: false }
        ],
        estimated_hours: 4,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tsk_05',
        user_id: demoUserId,
        project_id: 'prj_03_infra',
        title: 'Setup Redis Caching for Analytics Queries',
        description: 'Cache task completion velocity and priority aggregation metrics to maintain sub-50ms dashboard response times.',
        status: 'todo',
        priority: 'low',
        ai_priority_score: 38,
        ai_rationale: 'Can be deferred until active tenant count exceeds 5,000.',
        due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        tags: ['Performance', 'Infra'],
        subtasks: [
          { id: 'sub_11', title: 'Benchmark current DB load', completed: false }
        ],
        estimated_hours: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  };
};

class LocalDatabase {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[LocalDB] Warning reading cache file, generating fresh seed data.');
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  saveData(data = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[LocalDB] Error saving to file:', e.message);
    }
  }

  // Users
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user) {
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: user.email,
      password: user.password,
      full_name: user.full_name,
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      role: user.role || 'Member',
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  // Projects
  getProjects(userId) {
    return this.data.projects.filter(p => p.user_id === userId);
  }

  createProject(userId, projectData) {
    const project = {
      id: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name: projectData.name,
      description: projectData.description || '',
      color: projectData.color || '#6366F1',
      icon: projectData.icon || 'Folder',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.projects.push(project);
    this.saveData();
    return project;
  }

  updateProject(userId, projectId, updates) {
    const index = this.data.projects.findIndex(p => p.id === projectId && p.user_id === userId);
    if (index === -1) return null;
    this.data.projects[index] = {
      ...this.data.projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveData();
    return this.data.projects[index];
  }

  deleteProject(userId, projectId) {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => !(p.id === projectId && p.user_id === userId));
    // Also remove or unlink tasks belonging to this project
    this.data.tasks.forEach(t => {
      if (t.user_id === userId && t.project_id === projectId) {
        t.project_id = null;
      }
    });
    this.saveData();
    return this.data.projects.length < initialLen;
  }

  // Tasks
  getTasks(userId, filters = {}) {
    let result = this.data.tasks.filter(t => t.user_id === userId);

    if (filters.status && filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(t => t.priority === filters.priority);
    }
    if (filters.projectId && filters.projectId !== 'all') {
      result = result.filter(t => t.project_id === filters.projectId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (filters.sortBy) {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        if (filters.sortBy === 'due_date') {
          return ((a.due_date || '') > (b.due_date || '') ? 1 : -1) * order;
        }
        if (filters.sortBy === 'ai_priority_score') {
          return ((a.ai_priority_score || 0) > (b.ai_priority_score || 0) ? 1 : -1) * order;
        }
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title) * order;
        }
        return ((a.created_at || '') > (b.created_at || '') ? 1 : -1) * order;
      });
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }

  getTaskById(userId, taskId) {
    return this.data.tasks.find(t => t.id === taskId && t.user_id === userId);
  }

  createTask(userId, taskData) {
    const task = {
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      project_id: taskData.project_id || null,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      ai_priority_score: taskData.ai_priority_score || 50,
      ai_rationale: taskData.ai_rationale || '',
      due_date: taskData.due_date || null,
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      estimated_hours: Number(taskData.estimated_hours) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.tasks.push(task);
    this.saveData();
    return task;
  }

  updateTask(userId, taskId, updates) {
    const index = this.data.tasks.findIndex(t => t.id === taskId && t.user_id === userId);
    if (index === -1) return null;

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveData();
    return this.data.tasks[index];
  }

  deleteTask(userId, taskId) {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => !(t.id === taskId && t.user_id === userId));
    this.saveData();
    return this.data.tasks.length < initialLen;
  }
}

module.exports = new LocalDatabase();
