const express = require('express');
const db      = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/dashboard ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const uid = req.user.id;

    // Stats
    const [[stats]] = await db.execute(
      `SELECT
         (SELECT COUNT(*) FROM articles   WHERE user_id=?) AS total_articles,
         (SELECT COUNT(*) FROM categories WHERE user_id=?) AS total_categories,
         (SELECT COUNT(*) FROM favorites f JOIN articles a ON a.id=f.article_id WHERE f.user_id=?) AS total_favorites,
         (SELECT COUNT(*) FROM articles WHERE user_id=? AND pdf_filename IS NOT NULL) AS total_with_pdf`,
      [uid, uid, uid, uid]
    );

    // Recent articles (last 6)
    const [recent] = await db.execute(
      `SELECT a.id, a.title, a.authors, a.publication_year, a.created_at,
         GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories,
         GROUP_CONCAT(DISTINCT c.color ORDER BY c.name SEPARATOR ',') AS category_colors
       FROM articles a
       LEFT JOIN article_categories ac ON ac.article_id=a.id
       LEFT JOIN categories c ON c.id=ac.category_id AND c.user_id=?
       WHERE a.user_id=?
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT 6`,
      [uid, uid]
    );

    // Recent activity (last 10)
    const [activity] = await db.execute(
      `SELECT al.*, a.title AS article_title
       FROM activity_log al
       LEFT JOIN articles a ON a.id=al.entity_id
       WHERE al.user_id=?
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [uid]
    );

    res.json({
      success: true,
      stats,
      recent_articles: recent,
      recent_activity: activity
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
