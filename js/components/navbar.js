// EduBook Navbar Component
import store from '../store.js';
import router from '../router.js';

export function renderNavbar(container) {
  const currentUser = store.getCurrentUser();
  const allUsers = store.getUsers();
  
  // Create navbar layout
  container.innerHTML = `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="#dashboard" class="nav-brand">
          <i data-lucide="book-open" style="width: 28px; height: 28px;"></i>
          EduBook
        </a>

        <!-- Main Navigation Links -->
        <div class="nav-links" id="nav-menu">
          <a href="#dashboard" class="nav-link">
            <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
            Tableau de Bord
          </a>
          <a href="#catalog" class="nav-link">
            <i data-lucide="archive" style="width: 18px; height: 18px;"></i>
            Catalogue
          </a>
          <a href="#reservations" class="nav-link">
            <i data-lucide="calendar" style="width: 18px; height: 18px;"></i>
            Mes Réservations
          </a>
          ${currentUser.role === 'admin' ? `
            <a href="#admin" class="nav-link">
              <i data-lucide="shield" style="width: 18px; height: 18px;"></i>
              Administration
            </a>
          ` : ''}
          <a href="#profile" class="nav-link">
            <i data-lucide="user" style="width: 18px; height: 18px;"></i>
            Profil
          </a>
        </div>

        <!-- Right Side Actions -->
        <div class="nav-actions">
          <!-- Demo Role Switcher -->
          <div class="user-selector" id="user-role-selector" title="Changer d'utilisateur pour la démo">
            <div class="activity-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; background: var(--primary); color: white;">
              ${currentUser.avatar}
            </div>
            <span>${currentUser.name}</span>
            <span class="user-badge ${currentUser.role === 'admin' ? 'admin' : 'teacher'}">
              ${currentUser.role === 'admin' ? 'Admin' : 'Prof'}
            </span>
            <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
            
            <!-- Hidden dropdown menu (opens on click) -->
            <div class="user-dropdown-menu glass-card" id="user-dropdown" style="display: none; position: absolute; top: 60px; right: 80px; width: 220px; z-index: 1001; padding: 12px; gap: 8px; flex-direction: column;">
              <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Changer d'utilisateur :</p>
              ${allUsers.map(user => `
                <div class="dropdown-item" data-user-id="${user.id}" style="display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;">
                  <div class="activity-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; background: ${user.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'}; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold;">
                    ${user.avatar}
                  </div>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-main);">${user.name}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: capitalize;">${user.role}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Dark/Light Theme Toggle -->
          <button class="theme-toggle" id="theme-btn" title="Changer de thème">
            <i data-lucide="sun" class="sun-icon" style="width: 20px; height: 20px; display: none;"></i>
            <i data-lucide="moon" class="moon-icon" style="width: 20px; height: 20px; display: block;"></i>
          </button>

          <!-- Mobile Nav Toggle -->
          <button class="mobile-nav-toggle" id="mobile-toggle">
            <i data-lucide="menu" style="width: 24px; height: 24px;"></i>
          </button>
        </div>
      </div>
    </nav>
  `;

  // --- Initialize Event Listeners ---
  
  // Theme Toggle Logic
  const themeBtn = container.querySelector('#theme-btn');
  const sunIcon = themeBtn.querySelector('.sun-icon');
  const moonIcon = themeBtn.querySelector('.moon-icon');
  
  function updateThemeUI(theme) {
    if (theme === 'light') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  // Load current theme
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeUI(currentTheme);

  themeBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('edubook_theme', newTheme);
    updateThemeUI(newTheme);
    
    // Also re-render the icons just in case
    if (window.lucide) window.lucide.createIcons();
  });

  // User Dropdown Trigger
  const userSelector = container.querySelector('#user-role-selector');
  const userDropdown = container.querySelector('#user-dropdown');
  
  userSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = userDropdown.style.display === 'flex';
    userDropdown.style.display = isVisible ? 'none' : 'flex';
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    if (userDropdown) userDropdown.style.display = 'none';
  });

  // Handle switching users
  const dropdownItems = container.querySelectorAll('.dropdown-item');
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const userId = item.getAttribute('data-user-id');
      store.setCurrentUser(userId);
      userDropdown.style.display = 'none';
      
      // Re-render navbar to update active user profile
      renderNavbar(container);
      
      // Refresh the current page to update content according to new user
      router.handleRouting();
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = container.querySelector('#mobile-toggle');
  const navMenu = container.querySelector('#nav-menu');
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
  });
}
