const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/authMiddleware');

// All AI features require JWT authentication
router.use(authenticate);

router.post('/generate-description', aiController.generateDescription);
router.post('/smart-prioritize', aiController.smartPrioritize);
router.post('/generate-summary', aiController.generateSummary);

module.exports = router;
