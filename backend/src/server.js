require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check and API discovery
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'TaskFlow AI SaaS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      type: db.isSupabase() ? 'Supabase PostgreSQL' : 'Local Embedded Storage (Zero-Config Active)',
      connected: true
    },
    aiEngine: {
      geminiActive: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10),
      fallbackReady: true
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 TaskFlow AI Backend API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: ${db.isSupabase() ? 'Supabase' : 'Local Zero-Config Storage'}`);
    console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Google Gemini' : 'Smart Heuristics'}`);
    console.log(`==================================================\n`);
  });
}

module.exports = app;
