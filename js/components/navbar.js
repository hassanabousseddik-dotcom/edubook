// EduBook Navbar Component — avec déconnexion Supabase
import store from '../store.js';
import { signOut } from '../auth.js';

export function renderNavbar() {
  const container = document.getElementById('navbar');
  if (!container) return;

  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const avatarText = currentUser?.avatar || currentUser?.name?.substring(0, 2).toUpperCase() || 'US';

  container.innerHTML = `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="#dashboard" class="nav-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          EduBook
        </a>

        <div class="nav-links" id="nav-menu">
          <a href="#dashboard" class="nav-link">
            <i data-lucide="layout-dashboard" style="width:18px;height:18px;"></i>
            Tableau de Bord
          </a>
          <a href="#catalog" class="nav-link">
            <i data-lucide="archive" style="width:18px;height:18px;"></i>
            Catalogue
          </a>
          <a href="#reservations" class="nav-link">
            <i data-lucide="calendar" style="width:18px;height:18px;"></i>
            Mes Réservations
          </a>
          ${isAdmin ? `
          <a href="#admin" class="nav-link">
            <i data-lucide="shield" style="width:18px;height:18px;"></i>
            Administration
          </a>` : ''}
          <a href="#profile" class="nav-link">
            <i data-lucide="user" style="width:18px;height:18px;"></i>
            Profil
          </a>
        </div>

        <div class="nav-actions">
          <!-- Utilisateur connecté -->
          <div class="user-selector" id="user-menu-trigger" title="Mon compte">
            <div class="activity-avatar" style="width:28px;height:28px;font-size:0.75rem;background:var(--primary);color:white;">
              ${avatarText}
            </div>
            <span>${currentUser?.name || 'Utilisateur'}</span>
            <span class="user-badge ${isAdmin ? 'admin' : 'teacher'}">
              ${isAdmin ? 'Admin' : 'Prof'}
            </span>
            <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>

            <!-- Dropdown -->
            <div class="user-dropdown-menu glass-card" id="user-dropdown"
              style="display:none;position:absolute;top:60px;right:80px;width:220px;z-index:1001;padding:12px;flex-direction:column;gap:8px;">
              <div style="padding:8px 4px;border-bottom:1px solid var(--border-color);margin-bottom:4px;">
                <p style="font-size:0.8rem;font-weight:600;color:var(--text-main);">${currentUser?.name}</p>
                <p style="font-size:0.72rem;color:var(--text-muted);">${currentUser?.email || ''}</p>
              </div>
              <a href="#profile" class="dropdown-item" id="dropdown-profile"
                style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--radius-sm);cursor:pointer;text-decoration:none;color:var(--text-main);">
                <i data-lucide="user" style="width:16px;height:16px;"></i>
                Mon Profil
              </a>
              <button id="logout-btn"
                style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--radius-sm);cursor:pointer;background:none;border:none;color:var(--danger);font-size:0.9rem;width:100%;text-align:left;">
                <i data-lucide="log-out" style="width:16px;height:16px;"></i>
                Se déconnecter
              </button>
            </div>
          </div>

          <!-- Thème -->
          <button class="theme-toggle" id="theme-btn" title="Changer de thème">
            <i data-lucide="sun" class="sun-icon" style="width:20px;height:20px;display:none;"></i>
            <i data-lucide="moon" class="moon-icon" style="width:20px;height:20px;display:block;"></i>
          </button>

          <!-- Mobile toggle -->
          <button class="mobile-nav-toggle" id="mobile-toggle">
            <i data-lucide="menu" style="width:24px;height:24px;"></i>
          </button>
        </div>
      </div>
    </nav>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function initNavbar() {
  const container = document.getElementById('navbar');
  if (!container) return;

  // Thème
  const themeBtn = container.querySelector('#theme-btn');
  const sunIcon  = container.querySelector('.sun-icon');
  const moonIcon = container.querySelector('.moon-icon');

  function updateThemeUI(theme) {
    if (theme === 'light') { sunIcon.style.display = 'none';  moonIcon.style.display = 'block'; }
    else                   { sunIcon.style.display = 'block'; moonIcon.style.display = 'none';  }
  }
  updateThemeUI(document.documentElement.getAttribute('data-theme') || 'dark');

  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('edubook_theme', next);
    updateThemeUI(next);
    if (window.lucide) window.lucide.createIcons();
  });

  // Dropdown utilisateur
  const trigger  = container.querySelector('#user-menu-trigger');
  const dropdown = container.querySelector('#user-dropdown');

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const visible = dropdown.style.display === 'flex';
    dropdown.style.display = visible ? 'none' : 'flex';
  });

  document.addEventListener('click', () => {
    if (dropdown) dropdown.style.display = 'none';
  }, { capture: false });

  // Déconnexion
  container.querySelector('#logout-btn')?.addEventListener('click', async () => {
    try {
      await signOut();
      // app.js écoute le changement d'état auth et affiche le login
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  });

  // Mobile toggle
  const mobileToggle = container.querySelector('#mobile-toggle');
  const navMenu = container.querySelector('#nav-menu');
  mobileToggle?.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));

  // Active link highlight
  function updateActiveLink() {
    const hash = window.location.hash || '#dashboard';
    container.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  }
  updateActiveLink();
  window.addEventListener('hashchange', updateActiveLink);
}
