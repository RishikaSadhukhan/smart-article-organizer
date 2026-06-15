const express = require('express');
const { body, validationResult } = require('express-validator');
const db      = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/categories ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*,
         COUNT(DISTINCT ac.article_id) AS article_count
       FROM categories c
       LEFT JOIN article_categories ac ON ac.category_id = c.id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.name ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET categories:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/categories/:id ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM categories WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/categories ──────────────────────────────────
router.post('/', [
  body('name').trim().notEmpty().withMessage('Category name is required.').isLength({ max: 100 }),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Invalid hex color.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, description, color, icon } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO categories (user_id, name, description, color, icon) VALUES (?,?,?,?,?)',
      [req.user.id, name, description || null, color || '#6366f1', icon || 'folder']
    );
    res.status(201).json({ success: true, message: 'Category created.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Category name already exists.' });
    }
    console.error('POST category:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/categories/:id ───────────────────────────────
router.put('/:id', [
  body('name').trim().notEmpty().withMessage('Category name is required.').isLength({ max: 100 }),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Invalid hex color.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, description, color, icon } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE categories SET name=?, description=?, color=?, icon=? WHERE id=? AND user_id=?',
      [name, description || null, color || '#6366f1', icon || 'folder', req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Category name already exists.' });
    }
    console.error('PUT category:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/categories/:id ────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM categories WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('DELETE category:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
