/* ============================================================
   app.js — Shared utilities for Smart Article Organizer
   ============================================================ */

const API = '/api';

// ─── API Helper ─────────────────────────────────────────────
async function apiRequest(method, endpoint, data = null, isFormData = false) {
  const opts = {
    method,
    credentials: 'include',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }
  };
  if (data) opts.body = isFormData ? data : JSON.stringify(data);
  try {
    const res  = await fetch(API + endpoint, opts);
    const json = await res.json();
    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    return { ok: false, status: 0, data: { message: 'Network error. Is the server running?' } };
  }
}

const api = {
  get:    (ep)         => apiRequest('GET',    ep),
  post:   (ep, body)   => apiRequest('POST',   ep, body),
  put:    (ep, body)   => apiRequest('PUT',    ep, body),
  delete: (ep)         => apiRequest('DELETE', ep),
  upload: (ep, form)   => apiRequest('POST',   ep, form, true),
  uploadPut: (ep, form)=> apiRequest('PUT',    ep, form, true),
};

// ─── Auth Guard ──────────────────────────────────────────────
async function requireAuth() {
  const r = await api.get('/auth/me');
  if (!r.ok) {
    window.location.href = '/';
    return null;
  }
  return r.data.user;
}

async function redirectIfLoggedIn() {
  const r = await api.get('/auth/me');
  if (r.ok) window.location.href = '/pages/dashboard.html';
}

// ─── Current User ────────────────────────────────────────────
let _currentUser = null;
async function getCurrentUser() {
  if (_currentUser) return _currentUser;
  const r = await api.get('/auth/me');
  if (r.ok) _currentUser = r.data.user;
  return _currentUser;
}

// ─── Toast Notifications ─────────────────────────────────────
function showToast(message, type = 'info', title = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Modal ───────────────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }, 250);
}

function closeModalOnOverlay(overlayId) {
  const el = document.getElementById(overlayId);
  if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(overlayId); });
}

// ─── Confirm Dialog ──────────────────────────────────────────
function showConfirm(title, message, onConfirm) {
  let overlay = document.getElementById('confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div class="modal-body">
          <div class="confirm-dialog">
            <div class="confirm-icon">🗑️</div>
            <h3 id="confirm-title"></h3>
            <p  id="confirm-message"></p>
            <div style="display:flex;gap:10px;justify-content:center">
              <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
              <button class="btn btn-danger"    id="confirm-ok">Delete</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }
  document.getElementById('confirm-title').textContent   = title;
  document.getElementById('confirm-message').textContent = message;
  openModal('confirm-overlay');
  document.getElementById('confirm-cancel').onclick = () => closeModal('confirm-overlay');
  document.getElementById('confirm-ok').onclick     = () => { closeModal('confirm-overlay'); onConfirm(); };
}

// ─── Sidebar & Navigation ─────────────────────────────────────
async function initLayout() {
  const user = await requireAuth();
  if (!user) return null;

  _currentUser = user;

  // Render sidebar user card
  const avatarEls = document.querySelectorAll('.user-avatar');
  avatarEls.forEach(el => {
    el.style.background = user.avatar_color || '#6366f1';
    el.textContent = (user.full_name || user.username || '?')[0].toUpperCase();
  });

  const nameEls = document.querySelectorAll('.sidebar-username');
  nameEls.forEach(el => el.textContent = user.full_name || user.username);

  const roleEls = document.querySelectorAll('.sidebar-role');
  roleEls.forEach(el => el.textContent = user.institution || 'Researcher');

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
    link.addEventListener('click', () => {
      window.location.href = link.dataset.href || '#';
    });
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const sidebar   = document.querySelector('.sidebar');
  let overlay     = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api.post('/auth/logout');
      window.location.href = '/';
    });
  });

  // User card → profile
  document.querySelectorAll('.user-card-link').forEach(el => {
    el.addEventListener('click', () => window.location.href = '/pages/profile.html');
  });

  return user;
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)       return bytes + ' B';
  if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function categoryBadges(names, colors) {
  if (!names) return '';
  const nameArr  = names.split(', ').filter(Boolean);
  const colorArr = (colors || '').split(',');
  return nameArr.map((n, i) => {
    const c = colorArr[i] || '#6366f1';
    return `<span class="cat-badge" style="background:${c}22;color:${c};border:1px solid ${c}44">
              <span class="cat-dot" style="background:${c}"></span>${escHtml(n)}
            </span>`;
  }).join('');
}

function keywordTags(keywords) {
  if (!keywords) return '';
  return keywords.split(/[,;]+/).filter(k => k.trim()).map(k =>
    `<span class="tag">${escHtml(k.trim())}</span>`
  ).join('');
}

function setLoading(btn, loading, text = '') {
  if (loading) {
    btn.disabled = true;
    btn._origText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>${text || 'Loading…'}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._origText || text;
  }
}

function getErrors(data) {
  if (data.errors && data.errors.length) {
    return data.errors.map(e => e.msg).join(' ');
  }
  return data.message || 'Something went wrong.';
}

// Keyword chip input
function initKeywordInput(containerId, hiddenId) {
  const wrap  = document.getElementById(containerId);
  const input = document.getElementById(hiddenId + '_input');
  const hidden = document.getElementById(hiddenId);
  if (!wrap || !input) return;

  let keywords = hidden.value ? hidden.value.split(',').map(k=>k.trim()).filter(Boolean) : [];

  function render() {
    wrap.querySelectorAll('.keyword-chip').forEach(c => c.remove());
    keywords.forEach((kw, i) => {
      const chip = document.createElement('span');
      chip.className = 'keyword-chip';
      chip.innerHTML = `${escHtml(kw)} <button type="button" data-i="${i}">×</button>`;
      chip.querySelector('button').onclick = () => { keywords.splice(i, 1); render(); };
      wrap.insertBefore(chip, input);
    });
    hidden.value = keywords.join(', ');
  }

  input.addEventListener('keydown', e => {
    if (['Enter','Tab',',',';'].includes(e.key)) {
      e.preventDefault();
      const val = input.value.trim().replace(/[,;]+$/, '');
      if (val && !keywords.includes(val)) { keywords.push(val); render(); }
      input.value = '';
    }
  });

  render();
  return { setKeywords: (arr) => { keywords = arr.filter(Boolean); render(); } };
}
