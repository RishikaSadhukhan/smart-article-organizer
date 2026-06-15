const express = require('express');
const db      = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/favorites ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*,
         GROUP_CONCAT(DISTINCT c.name  ORDER BY c.name SEPARATOR ', ') AS categories,
         GROUP_CONCAT(DISTINCT c.color ORDER BY c.name SEPARATOR ',')  AS category_colors,
         f.created_at AS favorited_at,
         1 AS is_favorite
       FROM favorites f
       JOIN articles a ON a.id = f.article_id
       LEFT JOIN article_categories ac ON ac.article_id = a.id
       LEFT JOIN categories c          ON c.id = ac.category_id AND c.user_id = ?
       WHERE f.user_id = ?
       GROUP BY a.id, f.created_at
       ORDER BY f.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET favorites:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/favorites/:articleId ────────────────────────
router.post('/:articleId', async (req, res) => {
  try {
    // Verify article belongs to user
    const [art] = await db.execute(
      'SELECT id FROM articles WHERE id=? AND user_id=?',
      [req.params.articleId, req.user.id]
    );
    if (art.length === 0) return res.status(404).json({ success: false, message: 'Article not found.' });

    await db.execute(
      'INSERT IGNORE INTO favorites (user_id, article_id) VALUES (?,?)',
      [req.user.id, req.params.articleId]
    );
    res.json({ success: true, message: 'Added to favorites.' });
  } catch (err) {
    console.error('POST favorite:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/favorites/:articleId ─────────────────────
router.delete('/:articleId', async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM favorites WHERE user_id=? AND article_id=?',
      [req.user.id, req.params.articleId]
    );
    res.json({ success: true, message: 'Removed from favorites.' });
  } catch (err) {
    console.error('DELETE favorite:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
