// EduBook — Point d'entrée principal (SPA avec auth Supabase)
window.addEventListener("error", (event) => {
  console.error("GLOBAL ERROR:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("PROMISE ERROR:", event.reason);
});

import { getCurrentSession, onAuthStateChange } from './auth.js';
import { renderLogin, initLogin } from './components/login.js';
import { renderNavbar, initNavbar } from './components/navbar.js';
import { initRouter } from './router.js';
import store from './store.js';

const app = document.getElementById('app');
const mainContent = document.getElementById('main-content');

// Affiche un loader pendant l'initialisation
function showLoader() {
  app.innerHTML = `
    <div class="app-loader">
      <div class="loader-content">
        <div class="loader-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div class="loader-spinner"></div>
        <p class="loader-text">Chargement d'EduBook…</p>
      </div>
    </div>
  `;
}

// Affiche la page de login
function showLogin() {
  app.innerHTML = renderLogin();
  initLogin(async () => {
    await bootApp();
  });
}

// Démarre l'application après connexion
async function bootApp() {
  showLoader();
  try {
    await store.initialize();
    const user = store.getCurrentUser();
    if (!user) { showLogin(); return; }

    // Restaure le HTML de l'app
    app.innerHTML = `
      <nav id="navbar"></nav>
      <main id="main-content" class="main-content"></main>
    `;

    renderNavbar();
    initNavbar();
    initRouter();

    // Applique le thème sauvegardé
    const savedTheme = localStorage.getItem('edubook_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

  } catch (err) {
    console.error('Erreur au démarrage:', err);
    showLogin();
  }
}

// Point d'entrée principal
async function main() {
  showLoader();

  // Écoute les changements d'état d'auth
  onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      showLogin();
    }
  });

  // Vérifie si déjà connecté
  const session = await getCurrentSession();
  if (session) {
    await bootApp();
  } else {
    showLogin();
  }
}

main();
