const aiService = require('../services/aiService');
const db = require('../config/db');

// POST /api/ai/generate-description
const generateDescription = async (req, res, next) => {
  try {
    const { title, context = '' } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required to generate a specification.'
      });
    }

    const result = await aiService.generateDescription({ title, context });

    res.json({
      success: true,
      message: 'AI Task Description generated successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/smart-prioritize
const smartPrioritize = async (req, res, next) => {
  try {
    const { title, description = '', dueDate = null, tags = [] } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required for smart prioritization.'
      });
    }

    const result = await aiService.smartPrioritize({
      title,
      description,
      dueDate,
      tags
    });

    res.json({
      success: true,
      message: 'Smart task prioritization calculated.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/generate-summary
const generateSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Fetch all user's tasks from DB to get the live state
    const tasks = await db.getTasks(userId);

    const summary = await aiService.generateSummary(tasks);

    res.json({
      success: true,
      message: 'Daily standup & team summary generated.',
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateDescription,
  smartPrioritize,
  generateSummary
};
