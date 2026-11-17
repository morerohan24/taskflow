const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim().length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is empty.'
      });
    }

    req.token = token;

    // 1. If running with Supabase Cloud, verify directly via Supabase Auth
    if (db.isSupabase()) {
      try {
        const supabaseUser = await db.verifySupabaseToken(token);
        req.user = supabaseUser;
        return next();
      } catch (err) {
        return res.status(401).json({
          success: false,
          error: `Supabase authentication error: ${err.message}`
        });
      }
    }

    // 2. Local Mode: Cryptographically verify with environment-enforced JWT_SECRET
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Authentication token has expired. Please sign in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.'
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
