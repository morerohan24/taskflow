const db = require('../config/db');
const aiService = require('../services/aiService');

// Explicit Allowlist of fields that can be updated on a task
const ALLOWED_TASK_UPDATE_FIELDS = [
  'title',
  'description',
  'status',
  'priority',
  'project_id',
  'due_date',
  'tags',
  'subtasks',
  'estimated_hours',
  'ai_priority_score',
  'ai_rationale'
];

const VALID_STATUSES = ['todo', 'in_progress', 'review', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, projectId, search, sortBy, sortOrder } = req.query;

    const tasks = await db.getTasks(
      userId,
      { status, priority, projectId, search, sortBy, sortOrder },
      req.token
    );

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

    const task = await db.getTaskById(userId, taskId, req.token);
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

    // Security: Validate required fields and enums
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    let aiScore = 50;
    let aiRationale = '';
    let resolvedPriority = priority;

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

    // Construct sanitized payload explicitly - user_id is injected strictly from authenticated session
    const sanitizedPayload = {
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      status: resolvedPriority && status ? status : 'todo',
      priority: resolvedPriority,
      project_id: project_id || null,
      due_date: due_date || null,
      tags: Array.isArray(tags) ? tags : [],
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      estimated_hours: Math.max(0, Number(estimated_hours) || 0),
      ai_priority_score: aiScore,
      ai_rationale: aiRationale
    };

    const newTask = await db.createTask(userId, sanitizedPayload, req.token);

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

    // Security: Check if user attempts to modify immutable or protected identity fields
    if (req.body.user_id !== undefined && req.body.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot modify or reassign the task user_id owner.'
      });
    }

    if (req.body.id !== undefined && req.body.id !== taskId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: Task ID in payload cannot differ from route parameter.'
      });
    }

    const existing = await db.getTaskById(userId, taskId, req.token);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    // Security: Filter updates strictly through the explicit allowlist
    const sanitizedUpdates = {};
    for (const key of ALLOWED_TASK_UPDATE_FIELDS) {
      if (req.body[key] !== undefined) {
        sanitizedUpdates[key] = req.body[key];
      }
    }

    // Validate sanitized values
    if (sanitizedUpdates.status && !VALID_STATUSES.includes(sanitizedUpdates.status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (sanitizedUpdates.priority && !VALID_PRIORITIES.includes(sanitizedUpdates.priority)) {
      return res.status(400).json({
        success: false,
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    if (sanitizedUpdates.title !== undefined) {
      if (typeof sanitizedUpdates.title !== 'string' || sanitizedUpdates.title.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Task title cannot be empty.' });
      }
      sanitizedUpdates.title = sanitizedUpdates.title.trim();
    }

    if (sanitizedUpdates.estimated_hours !== undefined) {
      sanitizedUpdates.estimated_hours = Math.max(0, Number(sanitizedUpdates.estimated_hours) || 0);
    }

    const updatedTask = await db.updateTask(userId, taskId, sanitizedUpdates, req.token);

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

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const existing = await db.getTaskById(userId, taskId, req.token);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    const updatedTask = await db.updateTask(userId, taskId, { status }, req.token);

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

    const existing = await db.getTaskById(userId, taskId, req.token);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found or already deleted.' });
    }

    const deleted = await db.deleteTask(userId, taskId, req.token);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Failed to delete task.' });
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
  deleteTask,
  ALLOWED_TASK_UPDATE_FIELDS
};
