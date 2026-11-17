const db = require('../config/db');

// GET /api/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await db.getTasks(userId);
    const projects = await db.getProjects(userId);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const todo = tasks.filter(t => t.status === 'todo').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority breakdown
    const priorityCounts = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // Project breakdown
    const projectBreakdown = projects.map(p => {
      const pTasks = tasks.filter(t => t.project_id === p.id);
      const pDone = pTasks.filter(t => t.status === 'completed').length;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        total: pTasks.length,
        completed: pDone,
        percentage: pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0
      };
    });

    // Unassigned project tasks
    const unassignedTasks = tasks.filter(t => !t.project_id);
    if (unassignedTasks.length > 0) {
      const uDone = unassignedTasks.filter(t => t.status === 'completed').length;
      projectBreakdown.push({
        id: 'unassigned',
        name: 'General / Unassigned',
        color: '#94A3B8',
        total: unassignedTasks.length,
        completed: uDone,
        percentage: Math.round((uDone / unassignedTasks.length) * 100)
      });
    }

    // Overdue and upcoming
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'completed');
    const upcomingTasks = tasks.filter(t => t.due_date && t.due_date >= today && t.status !== 'completed');

    // Total estimated hours
    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
    const completedEstimatedHours = tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);

    // Productivity Score (formula: completionRate * 0.6 + low overdue factor * 0.4)
    const overduePenalty = Math.min(40, overdueTasks.length * 10);
    const productivityScore = Math.max(10, Math.min(100, Math.round(completionRate * 0.6 + (40 - overduePenalty))));

    res.json({
      success: true,
      data: {
        metrics: {
          totalTasks: total,
          completedTasks: completed,
          inProgressTasks: inProgress,
          reviewTasks: review,
          todoTasks: todo,
          completionRate,
          productivityScore,
          overdueCount: overdueTasks.length,
          totalEstimatedHours,
          completedEstimatedHours
        },
        priorityBreakdown: priorityCounts,
        projectBreakdown,
        overdueTasks: overdueTasks.slice(0, 5),
        upcomingTasks: upcomingTasks.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };
