const express = require('express');
const db      = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/analytics ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const uid = req.user.id;

    // Articles per category
    const [perCategory] = await db.execute(
      `SELECT c.name, c.color, COUNT(ac.article_id) AS count
       FROM categories c
       LEFT JOIN article_categories ac ON ac.category_id = c.id
       LEFT JOIN articles a ON a.id = ac.article_id AND a.user_id = ?
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY count DESC`,
      [uid, uid]
    );

    // Publication year distribution
    const [byYear] = await db.execute(
      `SELECT publication_year AS year, COUNT(*) AS count
       FROM articles
       WHERE user_id = ? AND publication_year IS NOT NULL
       GROUP BY publication_year
       ORDER BY publication_year ASC`,
      [uid]
    );

    // Upload trend (last 12 months)
    const [uploadTrend] = await db.execute(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m') AS month,
         COUNT(*) AS count
       FROM articles
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [uid]
    );

    // Most used keywords (top 20)
    const [keywordRows] = await db.execute(
      `SELECT keywords FROM articles WHERE user_id=? AND keywords IS NOT NULL AND keywords != ''`,
      [uid]
    );

    const kwCount = {};
    keywordRows.forEach(row => {
      if (!row.keywords) return;
      row.keywords.split(/[,;]+/).forEach(kw => {
        const k = kw.trim().toLowerCase();
        if (k) kwCount[k] = (kwCount[k] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(kwCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    // Articles with vs without PDF
    const [[pdfStats]] = await db.execute(
      `SELECT
         COUNT(*) AS total,
         SUM(pdf_filename IS NOT NULL) AS with_pdf,
         SUM(pdf_filename IS NULL)     AS without_pdf
       FROM articles WHERE user_id=?`,
      [uid]
    );

    res.json({
      success: true,
      per_category: perCategory,
      by_year:      byYear,
      upload_trend: uploadTrend,
      top_keywords: topKeywords,
      pdf_stats:    pdfStats
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
