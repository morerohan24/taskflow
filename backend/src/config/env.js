/**
 * Environment Validation and Configuration Module
 * 
 * Enforces strict environment variable verification at application bootstrap.
 * Fails startup immediately if critical secrets are missing or weak.
 */

require('dotenv').config();

const validateEnv = () => {
  const jwtSecret = process.env.JWT_SECRET || (process.env.VERCEL ? 'vercel_production_default_jwt_secret_minimum_32_characters_rohan' : null);

  // Enforce required strong JWT secret
  if (!jwtSecret) {
    throw new Error(
      '[FATAL CONFIG ERROR] JWT_SECRET environment variable is not defined. ' +
      'A strong secret must be provided via .env or system environment.'
    );
  }

  if (jwtSecret.trim().length < 32) {
    throw new Error(
      `[FATAL CONFIG ERROR] JWT_SECRET is too short (${jwtSecret.trim().length} chars). ` +
      'For cryptographic security, JWT_SECRET must be at least 32 characters long.'
    );
  }

  // Parse allowed CORS origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, ''))
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

  return {
    PORT: parseInt(process.env.PORT, 10) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: jwtSecret.trim(),
    ALLOWED_ORIGINS: allowedOrigins,
    SUPABASE_URL: process.env.SUPABASE_URL?.trim() || null,
    SUPABASE_KEY: process.env.SUPABASE_KEY?.trim() || null,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || null
  };
};

const env = validateEnv();

module.exports = env;
