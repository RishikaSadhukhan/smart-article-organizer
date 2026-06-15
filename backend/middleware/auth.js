const jwt = require('jsonwebtoken');
const db  = require('../config/db');

/**
 * Protect routes — verifies JWT from cookie or Authorization header.
 * Attaches req.user = { id, username, email } on success.
 */
async function protect(req, res, next) {
  try {
    let token = null;

    // 1. Try cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fall back to Authorization header (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists
    const [rows] = await db.execute(
      'SELECT id, username, email, full_name, institution, bio, avatar_color FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in.' });
  }
}

module.exports = { protect };
