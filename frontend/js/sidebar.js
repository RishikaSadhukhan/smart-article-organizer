/* sidebar.js — injects the shared sidebar + topbar HTML */
function renderSidebar(pageTitle, pageSubtitle = '') {
  const sidebarHTML = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark">📚</div>
      <div class="logo-text">Article Organizer <span>Research Management</span></div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-label">Main</div>
        <button class="nav-link" data-page="dashboard" data-href="/pages/dashboard.html">
          <span class="nav-icon">🏠</span> Dashboard
        </button>
        <button class="nav-link" data-page="articles" data-href="/pages/articles.html">
          <span class="nav-icon">📄</span> My Articles
        </button>
        <button class="nav-link" data-page="article-new" data-href="/pages/article-form.html">
          <span class="nav-icon">➕</span> Add Article
        </button>
      </div>

      <div class="nav-section">
        <div class="nav-section-label">Organize</div>
        <button class="nav-link" data-page="categories" data-href="/pages/categories.html">
          <span class="nav-icon">🗂️</span> Categories
        </button>
        <button class="nav-link" data-page="favorites" data-href="/pages/favorites.html">
          <span class="nav-icon">⭐</span> Favorites
        </button>
        <button class="nav-link" data-page="search" data-href="/pages/search.html">
          <span class="nav-icon">🔍</span> Search
        </button>
      </div>

      <div class="nav-section">
        <div class="nav-section-label">Insights</div>
        <button class="nav-link" data-page="analytics" data-href="/pages/analytics.html">
          <span class="nav-icon">📊</span> Analytics
        </button>
      </div>

      <div class="nav-section">
        <div class="nav-section-label">Account</div>
        <button class="nav-link" data-page="profile" data-href="/pages/profile.html">
          <span class="nav-icon">👤</span> Profile
        </button>
        <button class="nav-link logout-btn">
          <span class="nav-icon">🚪</span> Logout
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-card user-card-link">
        <div class="user-avatar"></div>
        <div class="user-info">
          <div class="name sidebar-username">Loading…</div>
          <div class="role sidebar-role">Researcher</div>
        </div>
      </div>
    </div>
  </aside>`;

  const topbarHTML = `
  <div class="topbar">
    <button class="hamburger" aria-label="Menu">☰</button>
    <div>
      <div class="topbar-title">${pageTitle}</div>
      ${pageSubtitle ? `<div class="topbar-subtitle">${pageSubtitle}</div>` : ''}
    </div>
    <div style="margin-left:auto;display:flex;gap:10px;align-items:center">
      <button class="btn btn-secondary btn-sm" onclick="window.location.href='/pages/article-form.html'">
        ＋ Add Article
      </button>
      <button class="btn btn-ghost btn-icon logout-btn" title="Logout">🚪</button>
    </div>
  </div>`;

  document.getElementById('sidebar-mount').innerHTML  = sidebarHTML;
  document.getElementById('topbar-mount').innerHTML   = topbarHTML;
}
