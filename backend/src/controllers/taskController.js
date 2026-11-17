const db = require('../config/db');
const aiService = require('../services/aiService');

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, projectId, search, sortBy, sortOrder } = req.query;

    const tasks = await db.getTasks(userId, {
      status,
      priority,
      projectId,
      search,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const task = await db.getTaskById(userId, taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      project_id = null,
      due_date = null,
      tags = [],
      subtasks = [],
      estimated_hours = 0,
      auto_ai_prioritize = false
    } = req.body;

    let aiScore = 50;
    let aiRationale = '';
    let resolvedPriority = priority;

    // Optional auto smart prioritization on creation
    if (auto_ai_prioritize) {
      const aiResult = await aiService.smartPrioritize({
        title,
        description,
        dueDate: due_date,
        tags
      });
      resolvedPriority = aiResult.priority;
      aiScore = aiResult.score;
      aiRationale = aiResult.rationale;
    }

    const newTask = await db.createTask(userId, {
      title,
      description,
      status,
      priority: resolvedPriority,
      ai_priority_score: aiScore,
      ai_rationale: aiRationale,
      project_id,
      due_date,
      tags,
      subtasks,
      estimated_hours
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const existing = await db.getTaskById(userId, taskId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    const updatedTask = await db.updateTask(userId, taskId, req.body);

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['todo', 'in_progress', 'review', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const existing = await db.getTaskById(userId, taskId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    const updatedTask = await db.updateTask(userId, taskId, { status });

    res.json({
      success: true,
      message: `Task moved to ${status}`,
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const deleted = await db.deleteTask(userId, taskId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Task not found or already deleted.' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
