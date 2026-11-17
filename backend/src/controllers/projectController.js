const db = require('../config/db');

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await db.getProjects(userId);
    const tasks = await db.getTasks(userId);

    // Attach task count per project
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

    const project = await db.createProject(userId, {
      name: name.trim(),
      description,
      color,
      icon
    });

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

    const updated = await db.updateProject(userId, projectId, req.body);
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

    const deleted = await db.deleteProject(userId, projectId);
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
