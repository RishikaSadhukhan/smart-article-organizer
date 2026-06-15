const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const { body, query, validationResult } = require('express-validator');
const db       = require('../config/db');
const { protect }   = require('../middleware/auth');
const { upload, uploadDir } = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// ─── Helper: log activity ───────────────────────────────────
async function logActivity(userId, action, entityId, detail) {
  try {
    await db.execute(
      'INSERT INTO activity_log (user_id, action, entity, entity_id, detail) VALUES (?,?,?,?,?)',
      [userId, action, 'article', entityId, detail || null]
    );
  } catch (_) {}
}

// ─── GET /api/articles ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, author, keyword, category_id, year, sort = 'newest', page = 1, limit = 12 } = req.query;
    const offset  = (parseInt(page) - 1) * parseInt(limit);
    const params  = [userId];
    let   where   = 'WHERE a.user_id = ?';

    if (search) {
      where += ' AND (a.title LIKE ? OR a.abstract LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (author) {
      where += ' AND a.authors LIKE ?';
      params.push(`%${author}%`);
    }
    if (keyword) {
      where += ' AND a.keywords LIKE ?';
      params.push(`%${keyword}%`);
    }
    if (year) {
      where += ' AND a.publication_year = ?';
      params.push(parseInt(year));
    }
    if (category_id) {
      where += ' AND EXISTS (SELECT 1 FROM article_categories ac WHERE ac.article_id=a.id AND ac.category_id=?)';
      params.push(parseInt(category_id));
    }

    const orderMap = {
      newest:  'a.created_at DESC',
      oldest:  'a.created_at ASC',
      title:   'a.title ASC',
      year:    'a.publication_year DESC'
    };
    const orderBy = orderMap[sort] || 'a.created_at DESC';

    // Count total
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM articles a ${where}`,
      params
    );
    const total = countRows[0].total;

    // Fetch articles with category info & favorite flag
    const dataParams = [...params, parseInt(limit), offset];
    const [articles] = await db.execute(
      `SELECT
         a.*,
         GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories,
         GROUP_CONCAT(DISTINCT c.id   ORDER BY c.name SEPARATOR ',')  AS category_ids,
         GROUP_CONCAT(DISTINCT c.color ORDER BY c.name SEPARATOR ',') AS category_colors,
         (SELECT COUNT(*) FROM favorites f WHERE f.article_id=a.id AND f.user_id=?) AS is_favorite
       FROM articles a
       LEFT JOIN article_categories ac ON ac.article_id = a.id
       LEFT JOIN categories         c  ON c.id = ac.category_id AND c.user_id = ?
       ${where}
       GROUP BY a.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [userId, userId, ...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data:  articles,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('GET articles:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/articles/:id ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         a.*,
         GROUP_CONCAT(DISTINCT c.name  ORDER BY c.name SEPARATOR ', ') AS categories,
         GROUP_CONCAT(DISTINCT c.id    ORDER BY c.name SEPARATOR ',')  AS category_ids,
         GROUP_CONCAT(DISTINCT c.color ORDER BY c.name SEPARATOR ',')  AS category_colors,
         (SELECT COUNT(*) FROM favorites f WHERE f.article_id=a.id AND f.user_id=?) AS is_favorite
       FROM articles a
       LEFT JOIN article_categories ac ON ac.article_id = a.id
       LEFT JOIN categories c          ON c.id = ac.category_id AND c.user_id = ?
       WHERE a.id = ? AND a.user_id = ?
       GROUP BY a.id`,
      [req.user.id, req.user.id, req.params.id, req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('GET article:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/articles ────────────────────────────────────
router.post('/', upload.single('pdf'), [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 500 }),
  body('publication_year').optional({ nullable: true }).isInt({ min: 1800, max: 2099 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    title, abstract, authors, publication_year, journal_conference,
    keywords, notes, doi, url, category_ids
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO articles
         (user_id, title, abstract, authors, publication_year, journal_conference,
          keywords, notes, pdf_filename, pdf_original_name, pdf_size, doi, url)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        title,
        abstract        || null,
        authors         || null,
        publication_year ? parseInt(publication_year) : null,
        journal_conference || null,
        keywords        || null,
        notes           || null,
        req.file ? req.file.filename      : null,
        req.file ? req.file.originalname  : null,
        req.file ? req.file.size          : null,
        doi  || null,
        url  || null
      ]
    );

    const articleId = result.insertId;

    // Assign categories
    if (category_ids) {
      const ids = (Array.isArray(category_ids) ? category_ids : category_ids.split(',')).map(Number).filter(Boolean);
      for (const cid of ids) {
        await db.execute(
          'INSERT IGNORE INTO article_categories (article_id, category_id) VALUES (?,?)',
          [articleId, cid]
        );
      }
    }

    await logActivity(req.user.id, 'created', articleId, title.substring(0, 100));
    res.status(201).json({ success: true, message: 'Article added successfully.', id: articleId });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('POST article:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/articles/:id ─────────────────────────────────
router.put('/:id', upload.single('pdf'), [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 500 }),
  body('publication_year').optional({ nullable: true }).isInt({ min: 1800, max: 2099 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Ownership check
    const [existing] = await db.execute(
      'SELECT id, pdf_filename FROM articles WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Article not found.' });

    const old = existing[0];
    const {
      title, abstract, authors, publication_year, journal_conference,
      keywords, notes, doi, url, category_ids, remove_pdf
    } = req.body;

    let pdf_filename     = old.pdf_filename;
    let pdf_original     = null;
    let pdf_size         = null;

    if (req.file) {
      // Delete old PDF
      if (old.pdf_filename) {
        const oldPath = path.join(uploadDir, old.pdf_filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      pdf_filename = req.file.filename;
      pdf_original = req.file.originalname;
      pdf_size     = req.file.size;
    } else if (remove_pdf === 'true' && old.pdf_filename) {
      const oldPath = path.join(uploadDir, old.pdf_filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      pdf_filename = null;
    }

    await db.execute(
      `UPDATE articles SET
         title=?, abstract=?, authors=?, publication_year=?, journal_conference=?,
         keywords=?, notes=?, doi=?, url=?,
         pdf_filename=?, pdf_original_name=COALESCE(?,pdf_original_name),
         pdf_size=COALESCE(?,pdf_size)
       WHERE id=? AND user_id=?`,
      [
        title,
        abstract        || null,
        authors         || null,
        publication_year ? parseInt(publication_year) : null,
        journal_conference || null,
        keywords        || null,
        notes           || null,
        doi             || null,
        url             || null,
        pdf_filename,
        pdf_original,
        pdf_size,
        req.params.id,
        req.user.id
      ]
    );

    // Update categories
    if (category_ids !== undefined) {
      await db.execute('DELETE FROM article_categories WHERE article_id=?', [req.params.id]);
      const ids = (Array.isArray(category_ids) ? category_ids : category_ids.split(',')).map(Number).filter(Boolean);
      for (const cid of ids) {
        await db.execute(
          'INSERT IGNORE INTO article_categories (article_id, category_id) VALUES (?,?)',
          [req.params.id, cid]
        );
      }
    }

    await logActivity(req.user.id, 'updated', req.params.id, title.substring(0, 100));
    res.json({ success: true, message: 'Article updated successfully.' });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('PUT article:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/articles/:id ──────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, pdf_filename, title FROM articles WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Article not found.' });

    const article = rows[0];
    if (article.pdf_filename) {
      const p = path.join(uploadDir, article.pdf_filename);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    await db.execute('DELETE FROM articles WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    await logActivity(req.user.id, 'deleted', req.params.id, article.title.substring(0, 100));
    res.json({ success: true, message: 'Article deleted.' });
  } catch (err) {
    console.error('DELETE article:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/articles/:id/download ────────────────────────
router.get('/:id/download', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT pdf_filename, pdf_original_name FROM articles WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Article not found.' });
    if (!rows[0].pdf_filename) return res.status(404).json({ success: false, message: 'No PDF attached.' });

    const filePath = path.join(uploadDir, rows[0].pdf_filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'PDF file missing from server.' });

    res.download(filePath, rows[0].pdf_original_name || rows[0].pdf_filename);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
