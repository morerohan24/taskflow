const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateProject } = require('../middleware/validateMiddleware');

// All project routes require JWT authentication
router.use(authenticate);

router.get('/', projectController.getProjects);
router.post('/', validateProject, projectController.createProject);
router.put('/:id', validateProject, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
