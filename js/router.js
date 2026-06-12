// EduBook SPA Router
import store from './store.js';
import toast from './utils/toast.js';

class EduBookRouter {
  constructor() {
    this.routes = {};
    this.defaultRoute = '#dashboard';
    
    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  register(hash, renderFunction, requiresAdmin = false) {
    this.routes[hash] = {
      render: renderFunction,
      requiresAdmin
    };
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  handleRouting() {
    let hash = window.location.hash || this.defaultRoute;
    
    // Find matching route
    let route = this.routes[hash];
    
    if (!route) {
      // Fallback if route does not exist
      this.navigate(this.defaultRoute);
      return;
    }

    // Role check for admin routes
    if (route.requiresAdmin) {
      const user = store.getCurrentUser();
      if (!user || user.role !== 'admin') {
        toast.warning("Accès refusé. Vous devez être administrateur pour accéder à cette page.");
        this.navigate(this.defaultRoute);
        return;
      }
    }

    // Hide mobile menu if open
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.classList.remove('mobile-open');
    }

    // Update active nav links
    this.updateActiveNavLink(hash);

    // Call render function
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Clear main content
      mainContent.innerHTML = '';
      
      // Render components
      try {
        route.render(mainContent);
        // Re-trigger Lucide icons parsing to render newly injected elements
        if (window.lucide) {
          window.lucide.createIcons();
        }
      } catch (error) {
        console.error("Routing error for " + hash, error);
        mainContent.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 40px;">
            <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--danger); margin-bottom: 16px;"></i>
            <h2>Erreur lors du chargement de la page</h2>
            <p style="color: var(--text-muted); margin-top: 10px;">${error.message}</p>
            <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.location.hash='#dashboard'">Retour au Tableau de Bord</button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  updateActiveNavLink(activeHash) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === activeHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  init() {
    this.handleRouting();
  }
}

const router = new EduBookRouter();
export default router;
