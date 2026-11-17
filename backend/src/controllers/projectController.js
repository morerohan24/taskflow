const db = require('../config/db');

const ALLOWED_PROJECT_UPDATE_FIELDS = ['name', 'description', 'color', 'icon'];

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await db.getProjects(userId, req.token);
    const tasks = await db.getTasks(userId, {}, req.token);

    // Calculate progress and task count per project
    const projectsWithMetrics = projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completedCount = projectTasks.filter(t => t.status === 'completed').length;
      return {
        ...project,
        task_count: projectTasks.length,
        completed_task_count: completedCount,
        progress_percentage: projectTasks.length > 0
          ? Math.round((completedCount / projectTasks.length) * 100)
          : 0
      };
    });

    res.json({
      success: true,
      count: projectsWithMetrics.length,
      data: projectsWithMetrics
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description = '', color = '#6366F1', icon = 'Folder' } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Project name is required.' });
    }

    const sanitized = {
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      color: color || '#6366F1',
      icon: icon || 'Folder'
    };

    const project = await db.createProject(userId, sanitized, req.token);

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    if (req.body.user_id !== undefined && req.body.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot modify the owner user_id of a project.'
      });
    }

    // Security: Filter strictly through allowlist
    const sanitizedUpdates = {};
    for (const key of ALLOWED_PROJECT_UPDATE_FIELDS) {
      if (req.body[key] !== undefined) {
        sanitizedUpdates[key] = req.body[key];
      }
    }

    if (sanitizedUpdates.name !== undefined) {
      if (typeof sanitizedUpdates.name !== 'string' || sanitizedUpdates.name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Project name cannot be empty.' });
      }
      sanitizedUpdates.name = sanitizedUpdates.name.trim();
    }

    const updated = await db.updateProject(userId, projectId, sanitizedUpdates, req.token);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    res.json({
      success: true,
      message: 'Project updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const deleted = await db.deleteProject(userId, projectId, req.token);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found or already deleted.' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};
