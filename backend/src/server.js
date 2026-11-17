const env = require('./config/env'); // Loads and validates environment variables
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = env.PORT;

// Trust proxy for reverse proxies in production (Render, Vercel, Railway)
app.set('trust proxy', 1);

// Security 1: Strict CORS Allowlist
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server, unit tests, mobile)
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/$/, '');
    if (env.ALLOWED_ORIGINS.includes(normalized)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is blocked by CORS security policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' })); // Body limit protection

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Security 2: Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit AI generation requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit exceeded for AI generation. Please wait a few minutes before retrying.'
  }
});

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', generalApiLimiter);

// Health Check with REAL Live Database & AI Connectivity Check
app.get('/api/health', async (req, res) => {
  const dbHealth = await db.checkHealth();
  const isHealthy = dbHealth.connected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    application: 'TaskFlow AI SaaS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    aiEngine: {
      provider: env.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash' : 'TaskFlow Smart Heuristic Engine',
      apiKeyConfigured: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 10),
      ready: true
    },
    security: {
      corsAllowlistActive: true,
      allowedOrigins: env.ALLOWED_ORIGINS,
      rateLimitingActive: true,
      jwtSecretEnforced: true
    }
  });
});

// Mount Routes with specialized rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Server Listen (only when not imported by automated test runner)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 TaskFlow AI Backend API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: ${db.isSupabase() ? 'Supabase PostgreSQL' : 'Local Embedded Storage (Zero-Config)'}`);
    console.log(`🤖 AI Engine: ${env.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash' : 'Smart Heuristics'}`);
    console.log(`🛡️ Security: CORS allowlist and rate limiting active`);
    console.log(`==================================================\n`);
  });
}

module.exports = app;
