const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');

const generateLocalToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role || 'Product Manager'
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    const result = await db.registerUser({
      email: email.toLowerCase().trim(),
      password,
      full_name: full_name.trim(),
      role: role || 'Product Manager'
    });

    // If Supabase returned an access_token, use it; otherwise generate local JWT
    const token = result.token || generateLocalToken(result.user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: result.user
      }
    });
  } catch (err) {
    if (err.statusCode === 409 || err.message?.includes('already exists') || err.message?.includes('already registered')) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await db.loginUser({
      email: email.toLowerCase().trim(),
      password
    });

    const token = result.token || generateLocalToken(result.user);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        token,
        user: result.user
      }
    });
  } catch (err) {
    if (err.statusCode === 401 || err.message?.includes('Invalid') || err.message?.includes('credentials')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.name,
        role: user.role || 'Member',
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/demo
const demoLogin = async (req, res, next) => {
  try {
    const demoUser = {
      id: 'usr_demo_8f9a2b1c',
      email: 'demo@taskflow.ai',
      full_name: 'Alex Rivera',
      role: 'Senior Product Manager',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const token = generateLocalToken(demoUser);

    res.json({
      success: true,
      message: 'Signed in as Demo Evaluator.',
      data: {
        token,
        user: demoUser
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin
};
