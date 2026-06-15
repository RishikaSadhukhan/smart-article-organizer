const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db       = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function setCookieAndRespond(res, token, user) {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   sevenDays
  });
  res.json({
    success: true,
    token,
    user: {
      id:           user.id,
      username:     user.username,
      email:        user.email,
      full_name:    user.full_name,
      institution:  user.institution,
      avatar_color: user.avatar_color
    }
  });
}

// ─── POST /api/auth/register ────────────────────────────────
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 characters.').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores.'),
  body('email').trim().isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('full_name').trim().isLength({ min: 2, max: 150 }).withMessage('Full name must be 2–150 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, email, password, full_name, institution } = req.body;

  try {
    // Check duplicates
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email or username already taken.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#10b981','#3b82f6'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, full_name, institution, avatar_color) VALUES (?,?,?,?,?,?)',
      [username, email, password_hash, full_name, institution || null, avatar_color]
    );

    const token = signToken(result.insertId);
    const user  = { id: result.insertId, username, email, full_name, institution, avatar_color };
    setCookieAndRespond(res, token, user);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────
router.post('/login', [
  body('email').trim().isEmail().withMessage('Invalid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT id, username, email, password_hash, full_name, institution, avatar_color FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    setCookieAndRespond(res, token, user);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ─── POST /api/auth/logout ──────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me ───────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── PUT /api/auth/profile ──────────────────────────────────
router.put('/profile', protect, [
  body('full_name').trim().isLength({ min: 2, max: 150 }).withMessage('Full name must be 2–150 characters.'),
  body('institution').optional({ nullable: true }).trim().isLength({ max: 200 }),
  body('bio').optional({ nullable: true }).trim().isLength({ max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { full_name, institution, bio, avatar_color } = req.body;
  try {
    await db.execute(
      'UPDATE users SET full_name=?, institution=?, bio=?, avatar_color=? WHERE id=?',
      [full_name, institution || null, bio || null, avatar_color || '#6366f1', req.user.id]
    );
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/auth/change-password ─────────────────────────
router.put('/change-password', protect, [
  body('current_password').notEmpty().withMessage('Current password is required.'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { current_password, new_password } = req.body;
  try {
    const [rows] = await db.execute('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
    const valid  = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await db.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
