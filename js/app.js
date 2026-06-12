// EduBook Application Entry Point
import store from './store.js';
import router from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderDashboard } from './components/dashboard.js';
import { renderCatalog } from './components/catalog.js';
import { renderReservations } from './components/reservations.js';
import { renderProfile } from './components/profile.js';
import { renderAdminPanel } from './components/adminPanel.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme initialization
  const savedTheme = localStorage.getItem('edubook_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Render Global Navbar
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    renderNavbar(navbarContainer);
  }

  // 3. Register SPA Routes
  router.register('#dashboard', (parent) => renderDashboard(parent));
  router.register('#catalog', (parent) => renderCatalog(parent));
  router.register('#reservations', (parent) => renderReservations(parent));
  router.register('#profile', (parent) => renderProfile(parent));
  
  // Protect admin panel - only administrators can view this
  router.register('#admin', (parent) => renderAdminPanel(parent), true);

  // 4. Initialize Router & Navigate to initial route
  router.init();

  // 5. Parse Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
