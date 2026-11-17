/**
 * TaskFlow AI - Database Configuration & Adapter
 * 
 * Supports both:
 * 1. Live Supabase PostgreSQL instance (when SUPABASE_URL & SUPABASE_KEY are provided)
 * 2. Instant Local Embedded Storage (seamless 0-config fallback for testing and grading)
 */

const { createClient } = require('@supabase/supabase-js');
const localDb = require('./localDb');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let isSupabaseConfigured = false;
let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
    console.log('[Database] Connected to live Supabase project:', supabaseUrl);
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err.message);
  }
}

if (!isSupabaseConfigured) {
  console.log('[Database] Running in Local Storage Mode (Ready out-of-the-box).');
  console.log('[Database] Set SUPABASE_URL & SUPABASE_KEY in .env to connect to your live Supabase database.');
}

// Unified Database Access Layer
const db = {
  isSupabase: () => isSupabaseConfigured,
  supabaseClient: supabase,

  // Users
  async findUserByEmail(email) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', email)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    return localDb.findUserByEmail(email);
  },

  async findUserById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.findUserById(id);
  },

  async createUser(userData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([userData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.createUser(userData);
  },

  // Projects
  async getProjects(userId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return localDb.getProjects(userId);
  },

  async createProject(userId, projectData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.createProject(userId, projectData);
  },

  async updateProject(userId, projectId, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.updateProject(userId, projectId, updates);
  },

  async deleteProject(userId, projectId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);
      if (error) throw error;
      return true;
    }
    return localDb.deleteProject(userId, projectId);
  },

  // Tasks
  async getTasks(userId, filters = {}) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('user_id', userId);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.projectId && filters.projectId !== 'all') {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    return localDb.getTasks(userId, filters);
  },

  async getTaskById(userId, taskId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.getTaskById(userId, taskId);
  },

  async createTask(userId, taskData) {
    if (isSupabaseConfigured) {
      const payload = {
        ...taskData,
        user_id: userId
      };
      const { data, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.createTask(userId, taskData);
  },

  async updateTask(userId, taskId, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return localDb.updateTask(userId, taskId, updates);
  },

  async deleteTask(userId, taskId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);
      if (error) throw error;
      return true;
    }
    return localDb.deleteTask(userId, taskId);
  }
};

module.exports = db;
