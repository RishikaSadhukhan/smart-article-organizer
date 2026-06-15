require('dotenv').config();
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const cors         = require('cors');

const app = express();

// ─── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret'));

// ─── Static Files ───────────────────────────────────────────
// Serve the frontend from /frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/articles',   require('./routes/articles'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/favorites',  require('./routes/favorites'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/analytics',  require('./routes/analytics'));

// ─── 404 for unknown API routes ─────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// ─── SPA Fallback – serve index.html for all non-API routes ─
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ─── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`
    });
  }
  if (err.message === 'Only PDF files are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Article Organizer running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});
