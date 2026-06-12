// EduBook SPA Router
import store from './store.js';
import toast from './utils/toast.js';
import { renderDashboard }   from './components/dashboard.js';
import { renderCatalog }     from './components/catalog.js';
import { renderReservations } from './components/reservations.js';
import { renderAdminPanel }  from './components/adminPanel.js';
import { renderProfile }     from './components/profile.js';

export function initRouter() {
  function handleRouting() {
    const hash = window.location.hash || '#dashboard';
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Ferme le menu mobile si ouvert
    document.querySelector('.nav-links')?.classList.remove('mobile-open');

    // Protection route admin
    if (hash === '#admin') {
      const user = store.getCurrentUser();
      if (!user || user.role !== 'admin') {
        toast.warning('Accès refusé. Réservé aux administrateurs.');
        window.location.hash = '#dashboard';
        return;
      }
    }

    // Active link highlight
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });

    mainContent.innerHTML = '';
    try {
      switch (hash) {
        case '#dashboard':    renderDashboard(mainContent);    break;
        case '#catalog':      renderCatalog(mainContent);      break;
        case '#reservations': renderReservations(mainContent); break;
        case '#admin':        renderAdminPanel(mainContent);   break;
        case '#profile':      renderProfile(mainContent);      break;
        default:
          window.location.hash = '#dashboard';
          return;
      }
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Routing error:', err);
      mainContent.innerHTML = `
        <div class="glass-card" style="text-align:center;padding:40px;">
          <i data-lucide="alert-triangle" style="width:48px;height:48px;color:var(--danger);margin-bottom:16px;"></i>
          <h2>Erreur lors du chargement</h2>
          <p style="color:var(--text-muted);margin-top:10px;">${err.message}</p>
          <button class="btn btn-primary" style="margin-top:20px;"
            onclick="window.location.hash='#dashboard'">Retour au Tableau de Bord</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Route initiale
}
